<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    public $timestamps = false;

    protected $fillable = ['nombre', 'color'];

    public function cursos(): HasMany
    {
        return $this->hasMany(Curso::class, 'area_id');
    }
}
