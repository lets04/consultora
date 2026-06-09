<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    public $timestamps = false;

    protected $fillable = ['nombre', 'nit', 'seprec', 'registro_ministerial', 'logo_url'];

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'nit' => $this->nit,
            'seprec' => $this->seprec,
            'registroMinisterial' => $this->registro_ministerial,
            'logoUrl' => $this->logo_url,
        ];
    }
}
