<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estudiante extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'ci', 'nombres', 'apellidos', 'prefijo', 'profesion',
        'telefono', 'email', 'departamento', 'observaciones',
    ];

    protected $casts = [
        'creado_en' => 'datetime',
        'actualizado_en' => 'datetime',
    ];

    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class, 'estudiante_id');
    }
}
