"""
Odoo database queries for commission reports.
Adapted from DKoInventory.
"""
import psycopg2
from django.conf import settings


def get_odoo_connection():
    """Get connection to Odoo PostgreSQL database."""
    return psycopg2.connect(
        dbname=settings.ODOO_DB_NAME,
        user=settings.ODOO_DB_USER,
        password=settings.ODOO_DB_PASSWORD,
        host=settings.ODOO_DB_HOST,
        port=settings.ODOO_DB_PORT
    )


# DKO company IDs: 1, 3, 4, 5, 13
# MV company ID: 2
COMPANY_IDS = {
    'dko': [1, 3, 4, 5, 13],
    'mv': [2]
}

# Commission rates
COMMISSION_RATES = {
    'dko': 0.013,  # 1.3%
    'mv': 0.01     # 1.0%
}


def get_commission_summary(date_ini, date_end, company, vendor_ids=None):
    """
    Get commission summary by vendor.
    Returns: List of {vendedor, rut, vnet, comision}
    """
    company_ids = COMPANY_IDS.get(company.lower(), [1])
    commission_rate = COMMISSION_RATES.get(company.lower(), 0.013)
    company_id_list = ','.join(str(c) for c in company_ids)
    
    vendor_filter = ""
    if vendor_ids:
        vendor_filter = f"AND he.id IN ({','.join(str(v) for v in vendor_ids)})"
    
    query = f"""
    WITH informe AS (
        SELECT
            DISTINCT(pt.default_code) AS sku,
            pc.short_code AS ru,
            pt.name AS descripcion,
            SUM(aml.quantity) AS cant,
            SUM(ROUND(aml.price_subtotal)) AS vnet,
            am.invoice_origin AS obs,
            am.name AS numero_boleta,
            he.name AS vendedor,
            he.identification_id AS rut,
            he.id AS vendedor_id,
            TO_CHAR(CAST(am.invoice_date AS DATE), 'YYYY-MM-DD') AS fecha
        FROM
            account_move_line aml
            LEFT JOIN account_move am ON am.id = aml.move_id
            LEFT JOIN product_product pp ON pp.id = aml.product_id
            LEFT JOIN product_template pt ON pp.product_tmpl_id = pt.id
            LEFT JOIN product_category pc ON pt.categ_id = pc.id
            LEFT JOIN pos_order po ON po.name = am.invoice_origin
            LEFT JOIN sale_order so ON so.name = am.invoice_origin
            LEFT JOIN hr_employee he ON he.id = po.seller_id OR he.id = so.sale_employee_id
        WHERE
            am.move_type = 'out_invoice'
            AND am.state = 'posted'
            AND am.company_id IN ({company_id_list})
            AND account_id = '132'
            AND pc.short_code = 'MU'
            AND he.name IS NOT NULL
            AND am.invoice_date BETWEEN %s AND %s
            {vendor_filter}
        GROUP BY
            pt.default_code, am.invoice_date, pt.name, am.invoice_origin, 
            am.name, he.name, he.id, pc.short_code, he.identification_id
    ),
    informe_nc AS (
        SELECT
            DISTINCT(pt.default_code) AS sku,
            pc.short_code AS ru,
            pt.name AS descripcion,
            SUM(aml.quantity) * -1 AS cant,
            SUM(ROUND(aml.price_subtotal)) * -1 AS vnet,
            am.ref AS obs,
            am.name AS numero_boleta,
            inf.vendedor AS vendedor,
            inf.rut AS rut,
            inf.vendedor_id AS vendedor_id,
            TO_CHAR(CAST(am.invoice_date AS DATE), 'YYYY-MM-DD') AS fecha
        FROM
            account_move_line aml
            LEFT JOIN account_move am ON am.id = aml.move_id
            LEFT JOIN product_product pp ON pp.id = aml.product_id
            LEFT JOIN product_template pt ON pp.product_tmpl_id = pt.id
            LEFT JOIN product_category pc ON pt.categ_id = pc.id
            LEFT JOIN informe inf ON inf.numero_boleta = am.invoice_origin AND inf.sku = pt.default_code
        WHERE
            am.move_type = 'out_refund'
            AND am.state = 'posted'
            AND am.company_id IN ({company_id_list})
            AND account_id = '132'
            AND am.invoice_date BETWEEN %s AND %s
            AND pc.short_code = 'MU'
            AND inf.vendedor IS NOT NULL
        GROUP BY
            pt.default_code, pt.name, am.invoice_origin, am.ref, am.name, 
            am.invoice_date, pc.short_code, inf.vendedor, inf.vendedor_id, inf.rut
    ),
    comision AS (
        SELECT * FROM informe
        UNION ALL
        SELECT * FROM informe_nc
    )
    SELECT 
        vendedor, 
        rut, 
        SUM(vnet) AS vnet, 
        ROUND(SUM(vnet) * {commission_rate}, 0) AS comision 
    FROM comision
    GROUP BY vendedor, rut
    ORDER BY vendedor
    """
    
    try:
        conn = get_odoo_connection()
        cursor = conn.cursor()
        cursor.execute(query, (date_ini, date_end, date_ini, date_end))
        columns = ['vendedor', 'rut', 'vnet', 'comision']
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"Error in get_commission_summary: {e}")
        return []


def get_commission_detail(date_ini, date_end, company, vendor_ids=None):
    """
    Get commission detail by transaction.
    Returns: List of transaction details
    """
    company_ids = COMPANY_IDS.get(company.lower(), [1])
    company_id_list = ','.join(str(c) for c in company_ids)
    
    vendor_filter = ""
    if vendor_ids:
        vendor_filter = f"AND he.id IN ({','.join(str(v) for v in vendor_ids)})"
    
    query = f"""
    WITH informe AS (
        SELECT
            DISTINCT(pt.default_code) AS sku,
            pt.name AS descripcion,
            SUM(aml.quantity) AS cantidad,
            SUM(ROUND(aml.price_subtotal)) AS vnet,
            am.name AS documento,
            CASE
                WHEN am.team_id = 2 THEN 'Web'
                WHEN am.team_id = 1 THEN 'Back Office'
                WHEN am.team_id = 3 THEN 'Pos'
                ELSE 'Otro'
            END AS canal,
            he.name AS vendedor,
            he.identification_id AS rut,
            TO_CHAR(CAST(am.invoice_date AS DATE), 'YYYY-MM-DD') AS fecha
        FROM
            account_move_line aml
            LEFT JOIN account_move am ON am.id = aml.move_id
            LEFT JOIN product_product pp ON pp.id = aml.product_id
            LEFT JOIN product_template pt ON pp.product_tmpl_id = pt.id
            LEFT JOIN product_category pc ON pt.categ_id = pc.id
            LEFT JOIN pos_order po ON po.name = am.invoice_origin
            LEFT JOIN sale_order so ON so.name = am.invoice_origin
            LEFT JOIN hr_employee he ON he.id = po.seller_id OR he.id = so.sale_employee_id
        WHERE
            am.move_type = 'out_invoice'
            AND am.state = 'posted'
            AND am.company_id IN ({company_id_list})
            AND account_id = '132'
            AND pc.short_code = 'MU'
            AND he.name IS NOT NULL
            AND am.invoice_date BETWEEN %s AND %s
            {vendor_filter}
        GROUP BY
            pt.default_code, pt.name, am.name, am.team_id, 
            he.name, he.identification_id, am.invoice_date
    )
    SELECT * FROM informe
    ORDER BY fecha DESC, vendedor
    """
    
    try:
        conn = get_odoo_connection()
        cursor = conn.cursor()
        cursor.execute(query, (date_ini, date_end))
        columns = ['sku', 'descripcion', 'cantidad', 'vnet', 'documento', 'canal', 'vendedor', 'rut', 'fecha']
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"Error in get_commission_detail: {e}")
        return []


def get_vendor_list(company):
    """
    Get list of vendors/sellers from Odoo.
    """
    company_ids = COMPANY_IDS.get(company.lower(), [1])
    company_id_list = ','.join(str(c) for c in company_ids)
    
    query = f"""
    SELECT DISTINCT
        he.id,
        he.name,
        he.identification_id AS rut
    FROM hr_employee he
    WHERE he.company_id IN ({company_id_list})
        AND he.active = true
    ORDER BY he.name
    """
    
    try:
        conn = get_odoo_connection()
        cursor = conn.cursor()
        cursor.execute(query)
        columns = ['id', 'name', 'rut']
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"Error in get_vendor_list: {e}")
        return []
