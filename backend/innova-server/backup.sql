--
-- PostgreSQL database dump
--

\restrict 5P3PQnvcH8LoVqJ6kqROdKkagMluB4xE8gR2sLFLaBbLeobKcFxCMj3fG5Cm1Ru

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoEstudiante; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoEstudiante" AS ENUM (
    'activo',
    'inactivo',
    'suspendido'
);


ALTER TYPE public."EstadoEstudiante" OWNER TO postgres;

--
-- Name: EstadoInscripcion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoInscripcion" AS ENUM (
    'activo',
    'completado',
    'retirado'
);


ALTER TYPE public."EstadoInscripcion" OWNER TO postgres;

--
-- Name: Modalidad; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Modalidad" AS ENUM (
    'certificado',
    'examen'
);


ALTER TYPE public."Modalidad" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'administrador',
    'gerente'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: TipoInscripcion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoInscripcion" AS ENUM (
    'promocion',
    'individual'
);


ALTER TYPE public."TipoInscripcion" OWNER TO postgres;

--
-- Name: TipoPago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoPago" AS ENUM (
    'efectivo',
    'transferencia'
);


ALTER TYPE public."TipoPago" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Area; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Area" (
    id integer NOT NULL,
    nombre text NOT NULL,
    color text DEFAULT '#2F5FD0'::text NOT NULL
);


ALTER TABLE public."Area" OWNER TO postgres;

--
-- Name: Area_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Area_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Area_id_seq" OWNER TO postgres;

--
-- Name: Area_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Area_id_seq" OWNED BY public."Area".id;


--
-- Name: Certificado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Certificado" (
    id integer NOT NULL,
    "inscripcionId" integer NOT NULL,
    "inscripcionCursoId" integer,
    "fechaEmision" timestamp(3) without time zone NOT NULL,
    codigo text
);


ALTER TABLE public."Certificado" OWNER TO postgres;

--
-- Name: Certificado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Certificado_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Certificado_id_seq" OWNER TO postgres;

--
-- Name: Certificado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Certificado_id_seq" OWNED BY public."Certificado".id;


--
-- Name: Curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Curso" (
    id integer NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "areaId" integer NOT NULL
);


ALTER TABLE public."Curso" OWNER TO postgres;

--
-- Name: Curso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Curso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Curso_id_seq" OWNER TO postgres;

--
-- Name: Curso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Curso_id_seq" OWNED BY public."Curso".id;


--
-- Name: Estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Estudiante" (
    id integer NOT NULL,
    ci text NOT NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    prefijo text,
    profesion text,
    telefono text,
    email text,
    departamento text,
    estado public."EstadoEstudiante" DEFAULT 'activo'::public."EstadoEstudiante" NOT NULL,
    observaciones text,
    "creadoEn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "actualizadoEn" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Estudiante" OWNER TO postgres;

--
-- Name: Estudiante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Estudiante_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Estudiante_id_seq" OWNER TO postgres;

--
-- Name: Estudiante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Estudiante_id_seq" OWNED BY public."Estudiante".id;


--
-- Name: Inscripcion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inscripcion" (
    id integer NOT NULL,
    "estudianteId" integer NOT NULL,
    tipo public."TipoInscripcion",
    "promocionId" integer,
    modalidad public."Modalidad",
    estado public."EstadoInscripcion" DEFAULT 'activo'::public."EstadoInscripcion" NOT NULL,
    "montoTotal" double precision NOT NULL,
    "montoPagado" double precision DEFAULT 0 NOT NULL,
    "creadoEn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Inscripcion" OWNER TO postgres;

--
-- Name: InscripcionCurso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InscripcionCurso" (
    id integer NOT NULL,
    "inscripcionId" integer NOT NULL,
    "cursoId" integer NOT NULL,
    nota double precision,
    completado boolean DEFAULT false NOT NULL
);


ALTER TABLE public."InscripcionCurso" OWNER TO postgres;

--
-- Name: InscripcionCurso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."InscripcionCurso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."InscripcionCurso_id_seq" OWNER TO postgres;

--
-- Name: InscripcionCurso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."InscripcionCurso_id_seq" OWNED BY public."InscripcionCurso".id;


--
-- Name: Inscripcion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Inscripcion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Inscripcion_id_seq" OWNER TO postgres;

--
-- Name: Inscripcion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Inscripcion_id_seq" OWNED BY public."Inscripcion".id;


--
-- Name: Pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pago" (
    id integer NOT NULL,
    "inscripcionId" integer NOT NULL,
    monto double precision NOT NULL,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tipoPago" public."TipoPago" NOT NULL,
    "numeroComprobante" text
);


ALTER TABLE public."Pago" OWNER TO postgres;

--
-- Name: Pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Pago_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Pago_id_seq" OWNER TO postgres;

--
-- Name: Pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Pago_id_seq" OWNED BY public."Pago".id;


--
-- Name: Promocion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Promocion" (
    id integer NOT NULL,
    nombre text NOT NULL,
    periodo text NOT NULL,
    activa boolean DEFAULT false NOT NULL,
    "creadoEn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Promocion" OWNER TO postgres;

--
-- Name: PromocionCurso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PromocionCurso" (
    "promocionId" integer NOT NULL,
    "cursoId" integer NOT NULL
);


ALTER TABLE public."PromocionCurso" OWNER TO postgres;

--
-- Name: Promocion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Promocion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Promocion_id_seq" OWNER TO postgres;

--
-- Name: Promocion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Promocion_id_seq" OWNED BY public."Promocion".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Area id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Area" ALTER COLUMN id SET DEFAULT nextval('public."Area_id_seq"'::regclass);


--
-- Name: Certificado id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Certificado" ALTER COLUMN id SET DEFAULT nextval('public."Certificado_id_seq"'::regclass);


--
-- Name: Curso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Curso" ALTER COLUMN id SET DEFAULT nextval('public."Curso_id_seq"'::regclass);


--
-- Name: Estudiante id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Estudiante" ALTER COLUMN id SET DEFAULT nextval('public."Estudiante_id_seq"'::regclass);


--
-- Name: Inscripcion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inscripcion" ALTER COLUMN id SET DEFAULT nextval('public."Inscripcion_id_seq"'::regclass);


--
-- Name: InscripcionCurso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InscripcionCurso" ALTER COLUMN id SET DEFAULT nextval('public."InscripcionCurso_id_seq"'::regclass);


--
-- Name: Pago id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pago" ALTER COLUMN id SET DEFAULT nextval('public."Pago_id_seq"'::regclass);


--
-- Name: Promocion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Promocion" ALTER COLUMN id SET DEFAULT nextval('public."Promocion_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Area" (id, nombre, color) FROM stdin;
1	Leyes en Salud	#ef4444
2	Programas en Salud	#22c55e
3	Sistemas en Salud	#3b82f6
4	Gestión Pública	#f59e0b
5	Ofimática	#6366f1
6	Idiomas	#ec4899
7	Otros	#64748b
8	Área Financiera	#14b8a6
\.


--
-- Data for Name: Certificado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Certificado" (id, "inscripcionId", "inscripcionCursoId", "fechaEmision", codigo) FROM stdin;
\.


--
-- Data for Name: Curso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Curso" (id, nombre, activo, "areaId") FROM stdin;
1	LEY Nº 1152 - SUS	t	1
2	LEY Nº 475	t	1
3	POLITICAS SAFCI	t	1
4	LEY Nº 3131	t	1
5	LEY Nº 1737	t	1
6	PRIMEROS AUXILIOS	t	1
7	URGENCIAS Y EMERGENCIAS MEDICAS	t	1
8	NORMAS DE BIOSEGURIDAD	t	1
9	REGLAMENTO GENERAL DE HOSPITALES	t	1
10	RNVE 2.0	t	1
11	BIOSEGURIDAD Y MANEJO DE RESIDUOS SOLIDOS	t	1
12	MANEJO DE EXPEDIENTE CLINICO	t	1
13	COD. SEGURIDAD SOCIAL	t	1
14	NORMATIVA DE SEGUROS PUBLICOS	t	1
15	PROTOCOLOS DE ATENCION DEL SEGURO UNICO DE SALUD	t	1
16	BIOSEGURIDAD HOSPITALARIA	t	1
17	AUXILIAR DE FARMACIA	t	1
18	MANEJO DE PACIENTES COVID	t	1
19	FISIOTERAPIA PARA PACIENTES COVID	t	1
20	ATENCION PREHOSPITALARIA	t	1
21	SALMI	t	2
22	SOAPS	t	2
23	SIAL	t	2
24	SNIS – VE	t	2
25	PAI	t	2
26	DENGUE	t	2
27	RABIA	t	2
28	FIEBRE AMARILLA	t	2
29	CHIKUNGUNYA	t	2
30	CADENA FRIA	t	2
31	ZIKA	t	2
32	TUBERCULOSIS	t	2
33	INFLUENZA	t	2
34	COQUELUCHE	t	2
35	VIH	t	2
36	SARAMPION	t	2
37	SICE	t	3
38	SIAF	t	3
39	SICOFS	t	3
40	SIP	t	3
41	D.S. 23318 – A	t	4
42	D.S. 0181 SABS	t	4
43	LEY Nº 1178 SAFCO	t	4
44	LEY Nº 004 M.Q.S.C.	t	4
45	POLITICAS PUBLICAS	t	4
46	LEY Nº 548	t	4
47	LEY Nº 348	t	4
48	LEY Nº 045	t	4
49	LEY Nº 243	t	4
50	D.S. 3981	t	4
51	LEY Nº 1990	t	4
52	LEY Nº 2492	t	4
53	LEY Nº 843	t	4
54	LEY Nº 393	t	4
55	LEY Nº 160	t	4
56	LEY Nº 1834	t	4
57	LEY Nº 2297	t	4
58	LEY Nº 1488	t	4
59	LEY Nº 2027	t	4
60	LEY Nº 070	t	4
61	LEY Nº 603	t	4
62	LEY Nº 223	t	4
63	PREVENCION DE LA VIOLENCIA	t	4
64	LEGAL TECH JUDICIAL	t	4
65	RELACIONES HUMANAS	t	4
66	WINDOWS	t	5
67	WORD	t	5
68	INTERNET	t	5
69	EXCEL	t	5
70	POWER POINT	t	5
71	PUBLISHER	t	5
72	QUECHUA	t	6
73	AYMARA	t	6
74	INGLES	t	6
75	ORATORIA Y LIDERAZGO	t	7
76	CLASES VACACIONAL	t	7
77	DETECCION DE BILLETES FALSOS	t	8
78	CAJEROS	t	8
79	ATENCION AL CLIENTE	t	8
80	OFICIAL DE CREDITOS	t	8
\.


--
-- Data for Name: Estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Estudiante" (id, ci, nombres, apellidos, prefijo, profesion, telefono, email, departamento, estado, observaciones, "creadoEn", "actualizadoEn") FROM stdin;
1	111	Luis	Lopez	\N	\N	\N	\N	\N	activo	\N	2026-04-18 16:57:37.98	2026-04-18 16:57:37.98
2	444	Ana	Rojas	\N	\N	\N	\N	\N	activo	\N	2026-04-18 16:57:37.98	2026-04-18 16:57:37.98
3	222	Maria	Perez	\N	\N	\N	\N	\N	activo	\N	2026-04-18 16:57:37.98	2026-04-18 16:57:37.98
4	333	Carlos	Gomez	\N	\N	\N	\N	\N	activo	\N	2026-04-18 16:57:37.98	2026-04-18 16:57:37.98
5	555	Pedro	Mamani	\N	\N	\N	\N	\N	activo	\N	2026-04-18 16:57:37.98	2026-04-18 16:57:37.98
\.


--
-- Data for Name: Inscripcion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inscripcion" (id, "estudianteId", tipo, "promocionId", modalidad, estado, "montoTotal", "montoPagado", "creadoEn") FROM stdin;
1	1	promocion	1	certificado	activo	300	0	2026-04-18 16:57:38.14
2	3	promocion	1	certificado	activo	250	0	2026-04-18 16:57:38.155
3	4	promocion	2	certificado	activo	200	0	2026-04-18 16:57:38.159
4	2	promocion	3	certificado	activo	180	0	2026-04-18 16:57:38.162
5	5	individual	\N	certificado	activo	80	0	2026-04-18 16:57:38.165
\.


--
-- Data for Name: InscripcionCurso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InscripcionCurso" (id, "inscripcionId", "cursoId", nota, completado) FROM stdin;
1	1	1	\N	f
2	1	2	\N	f
3	1	6	\N	f
4	1	16	\N	f
5	1	44	\N	f
6	2	1	\N	f
7	2	2	\N	f
8	2	6	\N	f
9	2	16	\N	f
10	3	67	\N	f
11	3	69	\N	f
12	3	68	\N	f
13	4	26	\N	f
14	4	31	\N	f
15	5	68	\N	f
\.


--
-- Data for Name: Pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pago" (id, "inscripcionId", monto, fecha, "tipoPago", "numeroComprobante") FROM stdin;
\.


--
-- Data for Name: Promocion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Promocion" (id, nombre, periodo, activa, "creadoEn") FROM stdin;
1	MARATÓN DE SALUD	Abril	t	2026-04-18 16:57:37.969
2	OFIMÁTICA PRO	Abril	t	2026-04-18 16:57:37.977
3	ENFERMEDADES FRECUENTES	Mayo	t	2026-04-18 16:57:37.978
\.


--
-- Data for Name: PromocionCurso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PromocionCurso" ("promocionId", "cursoId") FROM stdin;
1	1
1	2
1	6
1	16
1	44
2	67
2	69
2	68
2	70
2	66
3	26
3	31
3	32
3	35
3	36
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, role) FROM stdin;
1	admin	$2b$10$K8GYB/oWoIWSZCjKOMa5S.yNuYQEY29gi9ry99NlvFfri0qemyEFe	administrador
2	gerente	$2b$10$/sJSyfDrlXCd0Gcm3QP46OAsmND7z9Kw3E9GbWHC7ngmM3TMsCx/G	gerente
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6074db8f-51b3-4190-ac72-fc08ad032cf4	db059abb6888c79ddb88bf4e9b10a084c70eee7fa56821e9e319dc0fe1d83e71	2026-04-18 12:52:29.666915-04	20260408000255_init	\N	\N	2026-04-18 12:52:29.60877-04	1
26150a43-9b7b-480c-b8cc-2ed4f4b83229	15d3c4c874957e78c362781d638b36ca29d9c470379fd858066df35931470ce8	2026-04-18 12:52:30.424471-04	20260418165230_init	\N	\N	2026-04-18 12:52:30.421776-04	1
\.


--
-- Name: Area_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Area_id_seq"', 8, true);


--
-- Name: Certificado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Certificado_id_seq"', 1, false);


--
-- Name: Curso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Curso_id_seq"', 80, true);


--
-- Name: Estudiante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Estudiante_id_seq"', 5, true);


--
-- Name: InscripcionCurso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."InscripcionCurso_id_seq"', 15, true);


--
-- Name: Inscripcion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Inscripcion_id_seq"', 5, true);


--
-- Name: Pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Pago_id_seq"', 1, false);


--
-- Name: Promocion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Promocion_id_seq"', 3, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 2, true);


--
-- Name: Area Area_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_pkey" PRIMARY KEY (id);


--
-- Name: Certificado Certificado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Certificado"
    ADD CONSTRAINT "Certificado_pkey" PRIMARY KEY (id);


--
-- Name: Curso Curso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Curso"
    ADD CONSTRAINT "Curso_pkey" PRIMARY KEY (id);


--
-- Name: Estudiante Estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Estudiante"
    ADD CONSTRAINT "Estudiante_pkey" PRIMARY KEY (id);


--
-- Name: InscripcionCurso InscripcionCurso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InscripcionCurso"
    ADD CONSTRAINT "InscripcionCurso_pkey" PRIMARY KEY (id);


--
-- Name: Inscripcion Inscripcion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inscripcion"
    ADD CONSTRAINT "Inscripcion_pkey" PRIMARY KEY (id);


--
-- Name: Pago Pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_pkey" PRIMARY KEY (id);


--
-- Name: PromocionCurso PromocionCurso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromocionCurso"
    ADD CONSTRAINT "PromocionCurso_pkey" PRIMARY KEY ("promocionId", "cursoId");


--
-- Name: Promocion Promocion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Promocion"
    ADD CONSTRAINT "Promocion_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Area_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Area_nombre_key" ON public."Area" USING btree (nombre);


--
-- Name: Certificado_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Certificado_codigo_key" ON public."Certificado" USING btree (codigo);


--
-- Name: Certificado_inscripcionCursoId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Certificado_inscripcionCursoId_key" ON public."Certificado" USING btree ("inscripcionCursoId");


--
-- Name: Estudiante_ci_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Estudiante_ci_key" ON public."Estudiante" USING btree (ci);


--
-- Name: InscripcionCurso_inscripcionId_cursoId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InscripcionCurso_inscripcionId_cursoId_key" ON public."InscripcionCurso" USING btree ("inscripcionId", "cursoId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Certificado Certificado_inscripcionCursoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Certificado"
    ADD CONSTRAINT "Certificado_inscripcionCursoId_fkey" FOREIGN KEY ("inscripcionCursoId") REFERENCES public."InscripcionCurso"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Certificado Certificado_inscripcionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Certificado"
    ADD CONSTRAINT "Certificado_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES public."Inscripcion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Curso Curso_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Curso"
    ADD CONSTRAINT "Curso_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InscripcionCurso InscripcionCurso_cursoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InscripcionCurso"
    ADD CONSTRAINT "InscripcionCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES public."Curso"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InscripcionCurso InscripcionCurso_inscripcionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InscripcionCurso"
    ADD CONSTRAINT "InscripcionCurso_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES public."Inscripcion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inscripcion Inscripcion_estudianteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inscripcion"
    ADD CONSTRAINT "Inscripcion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES public."Estudiante"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inscripcion Inscripcion_promocionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inscripcion"
    ADD CONSTRAINT "Inscripcion_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES public."Promocion"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Pago Pago_inscripcionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES public."Inscripcion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PromocionCurso PromocionCurso_cursoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromocionCurso"
    ADD CONSTRAINT "PromocionCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES public."Curso"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PromocionCurso PromocionCurso_promocionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromocionCurso"
    ADD CONSTRAINT "PromocionCurso_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES public."Promocion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 5P3PQnvcH8LoVqJ6kqROdKkagMluB4xE8gR2sLFLaBbLeobKcFxCMj3fG5Cm1Ru

