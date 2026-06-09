<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificado extends Model
{
    public $timestamps = false;

    protected $fillable = ['inscripcion_id', 'inscripcion_curso_id', 'fecha_emision', 'codigo'];

    protected $casts = ['fecha_emision' => 'datetime'];

    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(Inscripcion::class, 'inscripcion_id');
    }
}
