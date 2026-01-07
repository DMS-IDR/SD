"""
Odoo Database Queries for Closing Sales
Adapted from DKoInventory closingSales.js
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from django.conf import settings


# Company mapping
COMPANIES = {
    '1': 'Dko',
    '2': 'Mv',
    '3': 'BazarED',
    '4': 'Peña',
    '5': 'Maipu',
    '13': 'PlzVesp'
}


def get_odoo_connection():
    """Get connection to Odoo PostgreSQL database"""
    return psycopg2.connect(
        dbname=settings.ODOO_DB_NAME,
        user=settings.ODOO_DB_USER,
        password=settings.ODOO_DB_PASSWORD,
        host=settings.ODOO_DB_HOST,
        port=settings.ODOO_DB_PORT
    )


def get_closing_totals(channel, date, cash, entity):
    """
    Get closing totals (gross amounts by payment method) - RESUMEN/TOTALES.
    """
    channels = [f"'{c.strip()}'" for c in channel.split(',')]
    cashes = [f"'{c.strip()}'" for c in cash.split(',')]
    cha = ','.join(channels)
    ca = ','.join(cashes)
    
    query = f"""
    WITH pos AS (
        SELECT
            CASE WHEN am.team_id = 3 THEN po.cashier END AS cajero,
            CASE WHEN am.team_id = 3 THEN (
                CASE WHEN py.payment_method_id in (3,36,55,66,76,77,78,82) THEN 'Anticipo'
                     WHEN py.payment_method_id in (12,37,56,74,83) THEN 'Transbank'
                     WHEN py.payment_method_id = 22 THEN '3 Cuotas sin Interés'
                     WHEN py.payment_method_id = 23 THEN '4 Cuotas Santander'
                     WHEN py.payment_method_id = 24 THEN '5 Cuotas Santander'
                     WHEN py.payment_method_id = 25 THEN '6 Cuotas Santander'
                     WHEN py.payment_method_id = 26 THEN '7 Cuotas Santander'
                     WHEN py.payment_method_id = 27 THEN '8 Cuotas Santander'
                     WHEN py.payment_method_id = 28 THEN '9 Cuotas Santander'
                     WHEN py.payment_method_id = 29 THEN '10 Cuotas Santander'
                     WHEN py.payment_method_id in (30,39,65,75) THEN 'Promoción Santander'
                     WHEN py.payment_method_id = 31 THEN '3 Cuotas Otros Bancos'
                     ELSE 'Efectivo'
                END
            ) ELSE 'Webpay' END AS metodo_pago,
            '' AS numero_tarjeta,
            py.amount AS bruto,
            rp.name AS cliente,
            TO_CHAR(CAST(invoice_date AS DATE), 'YYYY-MM-DD') AS fecha_emision,
            '' AS fecha_vencimiento,
            '' AS voucher,
            CASE WHEN am.team_id = 3 THEN split_part(split_part(po.name, '/', 1), '/', -1)
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS caja,
            CASE WHEN am.team_id = 3 THEN 'Pos'
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS canal,
            po.company_id as sucursal_po,
            so.company_id as sucursal_so
        FROM pos_order po
        LEFT JOIN account_move am ON po.name = am.invoice_origin
        LEFT JOIN pos_payment py ON py.pos_order_id = po.id
        LEFT JOIN res_partner rp ON rp.id = am.partner_id
        LEFT JOIN sale_order so ON so.name = am.invoice_origin
        LEFT JOIN res_users ru ON ru.id = so.user_id
        LEFT JOIN res_partner rp1 ON rp1.id = ru.partner_id
        WHERE
            am.company_id = 1
            AND (am.move_type = 'out_invoice' OR am.move_type = 'out_refund')
            AND am.state = 'posted' and am.name not like '%N/C%'
        GROUP BY
            po.cashier,py.payment_method_id,rp.name, am.team_id,am.invoice_date,po.name,py.amount,po.company_id,so.company_id
    ),
    ventas AS (
        SELECT
            rp1.name AS cajero,
            'Webpay' AS metodo_pago,
            '' AS numero_tarjeta,
            amount_total_signed AS bruto,
            rp.name AS cliente,
            TO_CHAR(CAST(invoice_date AS DATE), 'YYYY-MM-DD') AS fecha_emision,
            '' AS fecha_vencimiento,
            '' AS voucher,
            CASE WHEN am.team_id = 2 THEN 'Web'
                 WHEN am.team_id = 1 THEN 'Ventas'
            END AS caja,
            CASE WHEN am.team_id = 3 THEN 'Pos'
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS canal,
            po.company_id as sucursal_po,
            so.company_id as sucursal_so
        FROM account_move am
        LEFT JOIN pos_order po ON po.name = am.invoice_origin
        LEFT JOIN sale_order so ON so.name = am.invoice_origin
        LEFT JOIN res_partner rp ON rp.id = am.partner_id
        LEFT JOIN res_users ru ON ru.id = so.user_id
        LEFT JOIN res_partner rp1 ON rp1.id = ru.partner_id
        WHERE
            am.company_id = 1
            AND (am.move_type = 'out_invoice' OR am.move_type = 'out_refund')
            AND am.state = 'posted' AND (case when am.team_id = 1 then am.name not like '%N/C%' ELSE 1 = 1 end)
        GROUP BY
            rp.name, am.team_id,am.invoice_date,rp1.name,am.amount_total_signed,po.company_id,so.company_id
    ),
    ventasypos AS (
        select * from pos
        union all
        select * from ventas
    )

    SELECT metodo_pago, SUM(bruto) AS monto_bruto, count(*) as cantidad
    FROM ventasypos
    WHERE
        sucursal_po = {entity}
        AND fecha_emision = '{date}'
        AND canal in ({cha})
        AND caja in ({ca})
    GROUP BY metodo_pago order by metodo_pago
    """
    
    conn = get_odoo_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
    finally:
        conn.close()


def get_payment_methods_detail(channel, date, cash, entity):
    """
    Get detailed payment method breakdown - DETALLE MP (sin agrupar).
    """
    channels = [f"'{c.strip()}'" for c in channel.split(',')]
    cashes = [f"'{c.strip()}'" for c in cash.split(',')]
    cha = ','.join(channels)
    ca = ','.join(cashes)
    
    query = f"""
    WITH pos AS (
        SELECT
            CASE WHEN am.team_id = 3 THEN po.cashier END AS cajero,
            CASE WHEN am.team_id = 3 THEN (
                CASE WHEN py.payment_method_id in (3,36,55,66,76,77,78,82) THEN 'Anticipo'
                     WHEN py.payment_method_id in (12,37,56,74,83) THEN 'Transbank'
                     WHEN py.payment_method_id = 22 THEN '3 Cuotas sin Interés'
                     WHEN py.payment_method_id = 23 THEN '4 Cuotas Santander'
                     WHEN py.payment_method_id = 24 THEN '5 Cuotas Santander'
                     WHEN py.payment_method_id = 25 THEN '6 Cuotas Santander'
                     WHEN py.payment_method_id = 26 THEN '7 Cuotas Santander'
                     WHEN py.payment_method_id = 27 THEN '8 Cuotas Santander'
                     WHEN py.payment_method_id = 28 THEN '9 Cuotas Santander'
                     WHEN py.payment_method_id = 29 THEN '10 Cuotas Santander'
                     WHEN py.payment_method_id in (30,39,65,75) THEN 'Promoción Santander'
                     WHEN py.payment_method_id = 31 THEN '3 Cuotas Otros Bancos'
                     ELSE 'Efectivo'
                END
            ) ELSE 'Webpay' END AS metodo_pago,
            '' AS numero_tarjeta,
            py.amount AS bruto,
            rp.name AS cliente,
            TO_CHAR(CAST(invoice_date AS DATE), 'YYYY-MM-DD') AS fecha_emision,
            '' AS fecha_vencimiento,
            '' AS voucher,
            CASE WHEN am.team_id = 3 THEN split_part(split_part(po.name, '/', 1), '/', -1)
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS caja,
            CASE WHEN am.team_id = 3 THEN 'Pos'
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS canal,
            po.company_id as sucursal_po,
            so.company_id as sucursal_so
        FROM pos_order po
        LEFT JOIN account_move am ON po.name = am.invoice_origin
        LEFT JOIN pos_payment py ON py.pos_order_id = po.id
        LEFT JOIN res_partner rp ON rp.id = am.partner_id
        LEFT JOIN sale_order so ON so.name = am.invoice_origin
        LEFT JOIN res_users ru ON ru.id = so.user_id
        LEFT JOIN res_partner rp1 ON rp1.id = ru.partner_id
        WHERE
            am.company_id = 1
            AND (am.move_type = 'out_invoice' OR am.move_type = 'out_refund')
            AND am.state != 'draft' and am.name not like '%N/C%'
        GROUP BY
            po.cashier,py.payment_method_id,rp.name, am.team_id,am.invoice_date,po.name,py.amount,po.company_id,so.company_id
    ),
    ventas AS (
        SELECT
            rp1.name AS cajero,
            'Webpay' AS metodo_pago,
            '' AS numero_tarjeta,
            amount_total_signed AS bruto,
            rp.name AS cliente,
            TO_CHAR(CAST(invoice_date AS DATE), 'YYYY-MM-DD') AS fecha_emision,
            '' AS fecha_vencimiento,
            '' AS voucher,
            CASE WHEN am.team_id = 2 THEN 'Web'
                 WHEN am.team_id = 1 THEN 'Ventas'
            END AS caja,
            CASE WHEN am.team_id = 3 THEN 'Pos'
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS canal,
            po.company_id as sucursal_po,
            so.company_id as sucursal_so
        FROM account_move am
        LEFT JOIN pos_order po ON po.name = am.invoice_origin
        LEFT JOIN sale_order so ON so.name = am.invoice_origin
        LEFT JOIN res_partner rp ON rp.id = am.partner_id
        LEFT JOIN res_users ru ON ru.id = so.user_id
        LEFT JOIN res_partner rp1 ON rp1.id = ru.partner_id
        WHERE
            am.company_id = 1
            AND (am.move_type = 'out_invoice' OR am.move_type = 'out_refund')
            AND am.state = 'posted' AND (case when am.team_id = 1 then am.name not like '%N/C%' ELSE 1 = 1 end)
        GROUP BY
            rp.name, am.team_id,am.invoice_date,rp1.name,am.amount_total_signed,po.company_id,so.company_id
    ),
    ventasypos AS (
        select * from pos
        union all
        select * from ventas
    )

    SELECT * FROM ventasypos
    WHERE
        sucursal_po = {entity}
        AND fecha_emision = '{date}'
        AND canal in ({cha})
        AND caja in ({ca})
    order by metodo_pago
    """
    
    conn = get_odoo_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
    finally:
        conn.close()


def get_closing_dte_detail(channel, date, cash, entity):
    """
    Get DTE detail (documents) - DETALLE DTE.
    """
    channels = [f"'{c.strip()}'" for c in channel.split(',')]
    cashes = [f"'{c.strip()}'" for c in cash.split(',')]
    cha = ','.join(channels)
    ca = ','.join(cashes)
    
    query = f"""
    WITH cierre_ventas AS (
        SELECT
            CASE WHEN am.team_id = 3 THEN po.cashier ELSE rp1.name END AS cajero,
            am.name AS t_doc,
            split_part(split_part(am.name, ' ', 2), ' ', -1) AS folio,
            amount_total_signed AS bruto,
            rp.name AS cliente,
            TO_CHAR(CAST(invoice_date AS DATE), 'YYYY-MM-DD') AS fecha_emision,
            '' AS fecha_vencimiento,
            CASE WHEN am.team_id = 3 THEN split_part(split_part(po.name, '/', 1), '/', -1)
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS caja,
            CASE WHEN am.team_id = 3 THEN 'Pos'
                 WHEN am.team_id = 2 THEN 'Web'
                 ELSE 'Ventas'
            END AS canal,
            po.company_id as sucursal_po,
            so.company_id as sucursal_so
        FROM account_move am
        LEFT JOIN pos_order po ON po.name = am.invoice_origin
        LEFT JOIN pos_payment py ON py.pos_order_id = po.id
        LEFT JOIN res_partner rp ON rp.id = am.partner_id
        LEFT JOIN sale_order so ON so.name = am.invoice_origin
        LEFT JOIN res_users ru ON ru.id = so.user_id
        LEFT JOIN res_partner rp1 ON rp1.id = ru.partner_id
        WHERE
            am.company_id = 1
            AND (am.move_type = 'out_invoice' OR am.move_type = 'out_refund')
            AND am.state = 'posted' AND (case when am.team_id = 3 then am.name not like '%N/C%' ELSE 1 = 1 end)
        GROUP BY
            po.cashier,am.name,rp1.name,am.amount_total_signed,rp.name, am.team_id,am.invoice_date,po.name,po.company_id,so.company_id
    )

    SELECT * FROM cierre_ventas
    WHERE
        sucursal_po = {entity}
        AND fecha_emision = '{date}'
        AND canal in ({cha})
        AND caja in ({ca})
    order by t_doc asc
    """
    
    conn = get_odoo_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
    finally:
        conn.close()


def get_channels():
    """Get available sales channels"""
    query = """
    SELECT DISTINCT CASE WHEN am.team_id = 3 THEN 'Pos' 
                         WHEN am.team_id = 2 THEN 'Web' 
                         ELSE 'Ventas' 
                    END AS canal
    FROM account_move am
    LEFT JOIN pos_order po ON po.name = am.invoice_origin
    order by canal
    """
    
    conn = get_odoo_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
    finally:
        conn.close()


def get_cashes(entity):
    """Get available cash registers for an entity"""
    entity_filter = f" AND po.company_id = {entity}" if entity and int(entity) > 0 else ""
    
    query = f"""
    SELECT DISTINCT CASE WHEN am.team_id = 3 THEN split_part(split_part(po.name, '/', 1), '/', -1)
                         WHEN am.team_id = 2 THEN 'Web'
                         ELSE 'Ventas'
                    END AS caja,
                    po.company_id as sucursal_po
    FROM account_move am
    LEFT JOIN pos_order po ON po.name = am.invoice_origin
    WHERE
        CASE WHEN am.team_id = 3 THEN split_part(split_part(po.name, '/', 1), '/', -1)
             WHEN am.team_id = 2 THEN 'Web'
             ELSE 'Ventas'
        END IS NOT NULL
        AND (am.move_type = 'out_invoice' OR am.move_type = 'out_refund') 
        AND am.state = 'posted' AND (case when am.team_id = 1 then am.name not like '%N/C%' ELSE 1 = 1 end) {entity_filter}
    order by caja
    """
    
    conn = get_odoo_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
    finally:
        conn.close()


def get_companies():
    """Get available companies"""
    return [{'id': k, 'name': v} for k, v in COMPANIES.items()]
