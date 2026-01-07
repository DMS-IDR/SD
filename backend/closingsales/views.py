from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal

from . import odoo_queries


def convert_decimals(data):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(data, list):
        return [convert_decimals(item) for item in data]
    elif isinstance(data, dict):
        return {k: convert_decimals(v) for k, v in data.items()}
    elif isinstance(data, Decimal):
        return float(data)
    return data


class ClosingSalesInfoView(APIView):
    """
    GET: Get closing sales information for a date
    Query params: channel, date, cash, entity
    Returns: totales, detalleMP, detalleDTE
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        channel = request.query_params.get('channel', 'Pos,Web,Ventas')
        date = request.query_params.get('date')
        cash = request.query_params.get('cash', 'Ventas,Web')
        entity = request.query_params.get('entity', '1')
        
        if not date:
            return Response(
                {"error": "Date parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get all closing data
            totales = odoo_queries.get_closing_totals(channel, date, cash, entity)
            detalle_mp = odoo_queries.get_payment_methods_detail(channel, date, cash, entity)
            detalle_dte = odoo_queries.get_closing_dte_detail(channel, date, cash, entity)
            
            return Response({
                'totales': convert_decimals(totales),
                'detalleMP': convert_decimals(detalle_mp),
                'detalleDTE': convert_decimals(detalle_dte)
            })
            
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch closing data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChannelsView(APIView):
    """
    GET: Get available sales channels
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            channels = odoo_queries.get_channels()
            return Response(channels)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch channels: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CashesView(APIView):
    """
    GET: Get available cash registers
    Query params: entity
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        entity = request.query_params.get('entity', '0')
        
        try:
            cashes = odoo_queries.get_cashes(entity)
            return Response(cashes)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch cashes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CompaniesView(APIView):
    """
    GET: Get available companies
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            companies = odoo_queries.get_companies()
            return Response(companies)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch companies: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
