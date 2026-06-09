<?php

namespace App\Support;

class PagoHelper
{
    public static function status(float $montoTotal, float $montoPagado): string
    {
        if ($montoPagado >= $montoTotal) {
            return 'pagado';
        }

        if ($montoPagado > 0) {
            return 'parcial';
        }

        return 'pendiente';
    }
}
