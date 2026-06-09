<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Curso;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InnovaSeeder extends Seeder
{
    public function run(): void
    {
        Empresa::updateOrCreate(
            ['id' => 1],
            [
                'nombre' => 'Consultora Innova',
                'seprec' => '700810038',
                'nit' => '700536037',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin'],
            ['password' => Hash::make('admin123'), 'role' => 'administrador']
        );

        User::updateOrCreate(
            ['email' => 'gerente'],
            ['password' => Hash::make('gerente123'), 'role' => 'gerente']
        );

        $areasData = [
            [
                'nombre' => 'Leyes en Salud',
                'color' => '#ef4444',
                'cursos' => [
                    'LEY Nº 1152 - SUS', 'LEY Nº 475', 'POLITICAS SAFCI', 'LEY Nº 3131', 'LEY Nº 1737',
                    'PRIMEROS AUXILIOS', 'URGENCIAS Y EMERGENCIAS MEDICAS', 'NORMAS DE BIOSEGURIDAD',
                    'REGLAMENTO GENERAL DE HOSPITALES', 'RNVE 2.0',
                    'BIOSEGURIDAD Y MANEJO DE RESIDUOS SOLIDOS', 'MANEJO DE EXPEDIENTE CLINICO',
                    'COD. SEGURIDAD SOCIAL', 'NORMATIVA DE SEGUROS PUBLICOS',
                    'PROTOCOLOS DE ATENCION DEL SEGURO UNICO DE SALUD',
                    'BIOSEGURIDAD HOSPITALARIA', 'AUXILIAR DE FARMACIA',
                    'MANEJO DE PACIENTES COVID', 'FISIOTERAPIA PARA PACIENTES COVID',
                    'ATENCION PREHOSPITALARIA',
                ],
            ],
            [
                'nombre' => 'Programas en Salud',
                'color' => '#22c55e',
                'cursos' => [
                    'SALMI', 'SOAPS', 'SIAL', 'SNIS – VE', 'PAI', 'DENGUE', 'RABIA',
                    'FIEBRE AMARILLA', 'CHIKUNGUNYA', 'CADENA FRIA', 'ZIKA',
                    'TUBERCULOSIS', 'INFLUENZA', 'COQUELUCHE', 'VIH', 'SARAMPION',
                ],
            ],
            [
                'nombre' => 'Sistemas en Salud',
                'color' => '#3b82f6',
                'cursos' => ['SICE', 'SIAF', 'SICOFS', 'SIP'],
            ],
            [
                'nombre' => 'Gestión Pública',
                'color' => '#f59e0b',
                'cursos' => [
                    'D.S. 23318 – A', 'D.S. 0181 SABS', 'LEY Nº 1178 SAFCO',
                    'LEY Nº 004 M.Q.S.C.', 'POLITICAS PUBLICAS', 'LEY Nº 548',
                    'LEY Nº 348', 'LEY Nº 045', 'LEY Nº 243', 'D.S. 3981',
                    'LEY Nº 1990', 'LEY Nº 2492', 'LEY Nº 843', 'LEY Nº 393',
                    'LEY Nº 160', 'LEY Nº 1834', 'LEY Nº 2297', 'LEY Nº 1488',
                    'LEY Nº 2027', 'LEY Nº 070', 'LEY Nº 603', 'LEY Nº 223',
                    'PREVENCION DE LA VIOLENCIA', 'LEGAL TECH JUDICIAL', 'RELACIONES HUMANAS',
                ],
            ],
            [
                'nombre' => 'Ofimática',
                'color' => '#6366f1',
                'cursos' => ['WINDOWS', 'WORD', 'INTERNET', 'EXCEL', 'POWER POINT', 'PUBLISHER'],
            ],
            [
                'nombre' => 'Idiomas',
                'color' => '#ec4899',
                'cursos' => ['QUECHUA', 'AYMARA', 'INGLES'],
            ],
            [
                'nombre' => 'Otros',
                'color' => '#64748b',
                'cursos' => ['ORATORIA Y LIDERAZGO', 'CLASES VACACIONAL'],
            ],
            [
                'nombre' => 'Área Financiera',
                'color' => '#14b8a6',
                'cursos' => [
                    'DETECCION DE BILLETES FALSOS',
                    'CAJEROS',
                    'ATENCION AL CLIENTE',
                    'OFICIAL DE CREDITOS',
                ],
            ],
        ];

        foreach ($areasData as $areaData) {
            $area = Area::updateOrCreate(
                ['nombre' => $areaData['nombre']],
                ['color' => $areaData['color']]
            );

            foreach ($areaData['cursos'] as $cursoNombre) {
                Curso::updateOrCreate(
                    ['nombre' => $cursoNombre, 'area_id' => $area->id],
                    ['activo' => true]
                );
            }
        }
    }
}
