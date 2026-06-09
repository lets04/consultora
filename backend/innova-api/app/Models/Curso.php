<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Curso extends Model
{
    public $timestamps = false;

    protected $fillable = ['nombre', 'activo', 'area_id'];

    protected $casts = ['activo' => 'boolean'];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function inscripcionCursos(): HasMany
    {
        return $this->hasMany(InscripcionCurso::class, 'curso_id');
    }
}
