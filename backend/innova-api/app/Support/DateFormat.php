<?php

namespace App\Support;

use Carbon\Carbon;

class DateFormat
{
    /** Formato dd/mm/aaaa para respuestas JSON (compatibilidad con el front). */
    public static function es(Carbon|\DateTimeInterface|string|null $date): string
    {
        if ($date === null) {
            return 'N/A';
        }

        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);

        return $carbon->utc()->format('d/m/Y');
    }
}
