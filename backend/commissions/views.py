"""
Commission report API views.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from users.models import UserProfile
from . import odoo_queries


def get_user_company(request):
    """Get user's company from profile."""
    try:
        # Robust check for user_id to prevent HTML 500 errors
        if not hasattr(request, 'user_id'):
            return None
            
        user_id = request.user_id
        profile = UserProfile.objects.get(supabase_user_id=user_id)
        return profile.company.lower()
    except UserProfile.DoesNotExist:
        return None
    except Exception:
        return None


def check_commission_permission(request):
    """Check if user has permission to view commissions."""
    try:
        if not hasattr(request, 'user_id'):
            return False
            
        user_id = request.user_id
        profile = UserProfile.objects.get(supabase_user_id=user_id)
        return profile.can_view_commission
    except UserProfile.DoesNotExist:
        return False
    except Exception:
        return False


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_commissions(request):
    """
    Get commission report data.
    Query params:
    - date_ini: Start date (YYYY-MM-DD)
    - date_end: End date (YYYY-MM-DD)
    - vendors: Comma-separated vendor IDs (optional)
    """
    # Check permission
    if not check_commission_permission(request):
        return Response(
            {'error': 'No tienes permiso para ver comisiones'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get user's company
    company = get_user_company(request)
    if not company:
        return Response(
            {'error': 'Perfil de usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get query params
    date_ini = request.query_params.get('date_ini')
    date_end = request.query_params.get('date_end')
    vendors_param = request.query_params.get('vendors', '')
    
    if not date_ini or not date_end:
        return Response(
            {'error': 'Se requieren date_ini y date_end'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Parse vendor IDs
    vendor_ids = None
    if vendors_param:
        try:
            vendor_ids = [int(v.strip()) for v in vendors_param.split(',') if v.strip()]
        except ValueError:
            vendor_ids = None
    
    # Get commission data
    try:
        summary = odoo_queries.get_commission_summary(date_ini, date_end, company, vendor_ids)
        detail = odoo_queries.get_commission_detail(date_ini, date_end, company, vendor_ids)
        
        # Calculate totals
        total_vnet = sum(item.get('vnet', 0) or 0 for item in summary)
        total_comision = sum(item.get('comision', 0) or 0 for item in summary)
        
        return Response({
            'company': company.upper(),
            'date_ini': date_ini,
            'date_end': date_end,
            'summary': summary,
            'detail': detail,
            'totals': {
                'vnet': total_vnet,
                'comision': total_comision,
                'vendedores': len(summary)
            }
        })
    except Exception as e:
        return Response(
            {'error': f'Error al obtener datos: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vendors(request):
    """Get list of vendors for the selector."""
    # Check permission
    if not check_commission_permission(request):
        return Response(
            {'error': 'No tienes permiso para ver comisiones'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get user's company
    company = get_user_company(request)
    if not company:
        return Response(
            {'error': 'Perfil de usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        vendors = odoo_queries.get_vendor_list(company)
        return Response({'vendors': vendors})
    except Exception as e:
        return Response(
            {'error': f'Error al obtener vendedores: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
