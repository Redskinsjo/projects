--
-- PostgreSQL database dump
--

\restrict rufYRVY7qfM7c1aW9RvRY3kX98mhzpojZFvXQCCDL1YgC22MXob8XlChSbcul4G

-- Dumped from database version 17.10 (Homebrew)
-- Dumped by pg_dump version 17.10 (Homebrew)

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
-- Name: AuthProvider; Type: TYPE; Schema: public; Owner: moi
--

CREATE TYPE public."AuthProvider" AS ENUM (
    'GOOGLE',
    'MICROSOFT',
    'APPLE'
);


ALTER TYPE public."AuthProvider" OWNER TO moi;

--
-- Name: CandidateStatus; Type: TYPE; Schema: public; Owner: moi
--

CREATE TYPE public."CandidateStatus" AS ENUM (
    'INVITED',
    'STARTED',
    'COMPLETED',
    'ANALYZED',
    'SHORTLISTED',
    'REJECTED',
    'HIRED'
);


ALTER TYPE public."CandidateStatus" OWNER TO moi;

--
-- Name: CommunicationChannel; Type: TYPE; Schema: public; Owner: moi
--

CREATE TYPE public."CommunicationChannel" AS ENUM (
    'WHATSAPP',
    'SMS',
    'EMAIL'
);


ALTER TYPE public."CommunicationChannel" OWNER TO moi;

--
-- Name: EstimatedLevel; Type: TYPE; Schema: public; Owner: moi
--

CREATE TYPE public."EstimatedLevel" AS ENUM (
    'JUNIOR',
    'INTERMEDIATE',
    'SENIOR',
    'LEAD'
);


ALTER TYPE public."EstimatedLevel" OWNER TO moi;

--
-- Name: InvitationDeliveryStatus; Type: TYPE; Schema: public; Owner: moi
--

CREATE TYPE public."InvitationDeliveryStatus" AS ENUM (
    'PENDING',
    'SENT',
    'SIMULATED',
    'FAILED'
);


ALTER TYPE public."InvitationDeliveryStatus" OWNER TO moi;

--
-- Name: MessageRole; Type: TYPE; Schema: public; Owner: moi
--

CREATE TYPE public."MessageRole" AS ENUM (
    'SYSTEM',
    'ASSISTANT',
    'USER'
);


ALTER TYPE public."MessageRole" OWNER TO moi;

--
-- Name: Recommendation; Type: TYPE; Schema: public; Owner: moi
--

CREATE TYPE public."Recommendation" AS ENUM (
    'REJECT',
    'CONSIDER',
    'INTERVIEW',
    'STRONG_MATCH'
);


ALTER TYPE public."Recommendation" OWNER TO moi;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Candidate; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."Candidate" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    "phoneNumber" text,
    "resumeUrl" text,
    status public."CandidateStatus" DEFAULT 'INVITED'::public."CandidateStatus" NOT NULL,
    score double precision,
    "jobOfferId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Candidate" OWNER TO moi;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Company" OWNER TO moi;

--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "candidateId" text NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Conversation" OWNER TO moi;

--
-- Name: InvitationToken; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."InvitationToken" (
    id text NOT NULL,
    token text NOT NULL,
    "candidateId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    channel public."CommunicationChannel",
    "deliveryStatus" public."InvitationDeliveryStatus",
    "deliveryMessage" text,
    "sentAt" timestamp(3) without time zone
);


ALTER TABLE public."InvitationToken" OWNER TO moi;

--
-- Name: JobOffer; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."JobOffer" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "requiredSkills" jsonb NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JobOffer" OWNER TO moi;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    role public."MessageRole" NOT NULL,
    content text NOT NULL,
    "conversationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Message" OWNER TO moi;

--
-- Name: OAuthAccount; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."OAuthAccount" (
    id text NOT NULL,
    "userId" text NOT NULL,
    provider public."AuthProvider" NOT NULL,
    "providerAccountId" text NOT NULL,
    email text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "displayName" text,
    "firstName" text,
    "lastName" text,
    "avatarUrl" text,
    "rawProfile" jsonb
);


ALTER TABLE public."OAuthAccount" OWNER TO moi;

--
-- Name: PasswordCredential; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."PasswordCredential" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PasswordCredential" OWNER TO moi;

--
-- Name: Recruiter; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."Recruiter" (
    id text NOT NULL,
    email text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Recruiter" OWNER TO moi;

--
-- Name: Report; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."Report" (
    id text NOT NULL,
    "candidateId" text NOT NULL,
    summary text NOT NULL,
    strengths jsonb NOT NULL,
    weaknesses jsonb NOT NULL,
    "estimatedLevel" public."EstimatedLevel" NOT NULL,
    score double precision NOT NULL,
    recommendation public."Recommendation" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Report" OWNER TO moi;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "tokenHash" text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO moi;

--
-- Name: User; Type: TABLE; Schema: public; Owner: moi
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "firstName" text,
    "lastName" text,
    "emailVerifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "avatarUrl" text
);


ALTER TABLE public."User" OWNER TO moi;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: moi
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


ALTER TABLE public._prisma_migrations OWNER TO moi;

--
-- Data for Name: Candidate; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."Candidate" (id, "firstName", "lastName", email, "phoneNumber", "resumeUrl", status, score, "jobOfferId", "createdAt", "updatedAt") FROM stdin;
cmqf8khac0002h8yk9yjtag9v	Jonathan	Carnos	jonathan.carnos@gmail.com	0651522399	https://cvdesignr.com/p/6a0c7c633f387	ANALYZED	67	cmqf8jffq0001h8ykgrjt1cs7	2026-06-15 13:15:35.94	2026-06-15 13:22:45.412
cmqfg6ue20000ucykyqsgssr1	Lionel	Carnos	jonathan.carnos@gmail.com	0651522399	\N	INVITED	\N	cmqf8jffq0001h8ykgrjt1cs7	2026-06-15 16:48:56.666	2026-06-15 16:48:56.666
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."Company" (id, name, "createdAt", "updatedAt") FROM stdin;
cmqf8gjzz0000h8yklfrvnb9a	YouMeet	2026-06-15 13:12:32.831	2026-06-15 13:12:32.831
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."Conversation" (id, "candidateId", "completedAt", "createdAt", "updatedAt") FROM stdin;
cmqf8kowf0004h8ykmcuf4omk	cmqf8khac0002h8yk9yjtag9v	2026-06-15 13:20:29.384	2026-06-15 13:15:45.807	2026-06-15 13:20:29.393
\.


--
-- Data for Name: InvitationToken; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."InvitationToken" (id, token, "candidateId", "expiresAt", "usedAt", "createdAt", channel, "deliveryStatus", "deliveryMessage", "sentAt") FROM stdin;
cmqf8khae0003h8ykj9vsex5r	zbEcwrYVd7Loa8Gj0GI8ZtxlLg6INGNC0Yvq2Q1WdZA	cmqf8khac0002h8yk9yjtag9v	2026-06-22 13:15:35.917	2026-06-15 13:15:45.813	2026-06-15 13:15:35.94	\N	\N	\N	\N
cmqfg6ue60001ucykskxqjth2	CZ7go7MitWROMsm0mOiCCqHruz0LplUl8lcIWZixy6I	cmqfg6ue20000ucykyqsgssr1	2026-06-22 16:48:56.65	\N	2026-06-15 16:48:56.666	\N	\N	\N	\N
\.


--
-- Data for Name: JobOffer; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."JobOffer" (id, title, description, "requiredSkills", "companyId", "createdAt", "updatedAt") FROM stdin;
cmqf8jffq0001h8ykgrjt1cs7	Développeur full-stack	Fondé en 1994, YouMeet est une société française leader des progiciels pour les plateaux techniques des établissements de santé publics et privés. Sa suite d'applications intégrées Xplore répond aux besoins des services de diagnostic médical (radiologie, cardiologie, médecine nucléaire...).\nNos solutions sont aujourd'hui déployées dans plus de 600 services médicaux et utilisées par plus de 15 000 utilisateurs en France et en Europe.\nAnticiper les évolutions technologiques et réglementaires, être au plus proche de nos clients et proposer des solutions toujours plus performantes, robustes et fiables : voilà le moteur de nos équipes au quotidien.\nLes missions du poste\nVous souhaitez évoluer dans un environnement dynamique, à la pointe de l'innovation au service de la santé ? Relever des défis technologiques stimulants ?\nRejoignez notre équipe R&D et participez au développement de solutions logicielles innovantes utilisées par des professionnels de santé en France et en Europe.\nIntégré(e) au sein de notre équipe R&D composée d'une vingtaine de collaborateurs, vous intervenez sur l'ensemble du cycle de développement, en back-end comme en front-end, avec une réelle autonomie sur vos projets.\nVotre quotidien dans nos équipes\nConcevoir et développer des applications web performantes et innovantes\nDévelopper et intégrer les modules fonctionnels associés\nParticiper à la mise en production et assurer le suivi des applications\nÊtre force de proposition sur les choix techniques et les améliorations à court, moyen et long terme\nCollaborer étroitement avec les équipes internes dans une logique agile\nAssurer une veille technologique continue\nLe profil recherché\nVos atouts pour réussir :\nFormation supérieure en développement informatique\nMaîtrise des technologies : C#, .NET 6, Oracle, PostgreSQL, Vue.js 3, React, AngularJS, MAUI\nCapacité d'analyse, autonomie et esprit d'initiative\nGoût pour l'innovation et les environnements techniques exigeants\nEsprit d'équipe et volonté de s'investir dans un projet commun\nLes plus :\nUne expérience dans le domaine de la santé\nLa maîtrise de la norme DICOM\nLa pratique de l'italien et/ou de l'allemand\nVotre profil\nPassionné(e) par le développement logiciel, vous souhaitez vous investir dans des projets à forte valeur ajoutée dans le domaine de la e-santé.\nVous êtes à l'aise en anglais, à l'écrit comme à l'oral ( Bon niveau requis), et capable d'évoluer dans un environnement international.\nCurieux(se), impliqué(e) et force de proposition, vous aimez relever des défis techniques et contribuer activement à l'amélioration continue des solutions.\nCe que nous vous offrons\nUn accompagnement et un tutorat personnalisé dès votre intégration\nUne entreprise à taille humaine, agile, avec un esprit collaboratif\nDes projets innovants au coeur des enjeux de la e-santé\nDe réelles perspectives d'évolution\nDes valeurs fortes : autonomie, esprit d'initiative, innovation, diversité\nAvantages\nPackage de rémunération attractif et évolutif\nPlan d'Épargne Entreprise (PEE) avec abondement\nPrimes vacances\nPlateforme avantages Sport / Culture / Loisirs (EdenRed)\nActivités sportives (Yoga, Futsal, weekend ski)\nEnvironnement de travail dynamique, convivial et stimulant\nNotre processus de recrutement\nVotre candidature retient notre attention ?\nVous êtes convié(e) à un entretien RH et opérationnel avec notre Responsable RH et le Responsable R&D.\nNous nous engageons à vous faire un retour sous 15 jours après l'entretien.\nEnvie de rejoindre l'aventure ?\nEnvie de contribuer à des projets technologiques innovants au service de la santé ?\nPostulez dès aujourd'hui et participez à la transformation numérique du secteur médical avec YouMeet.	["React", "Node.js", "Typescript"]	cmqf8gjzz0000h8yklfrvnb9a	2026-06-15 13:14:46.886	2026-06-15 13:14:46.886
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."Message" (id, role, content, "conversationId", "createdAt") FROM stdin;
cmqf8kowg0005h8yk5p54p6ij	SYSTEM	Entretien IA Stormeye. Objectif: verifier competences, experience, coherence et motivation.	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:15:45.807
cmqf8kowg0006h8ykrukx59b5	ASSISTANT	Pouvez-vous resumer votre experience la plus pertinente pour ce poste ?	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:15:45.807
cmqf8m29k0007h8yky41nqhgn	USER	J'ai travaillé sur une période de 2 ans en tant que développeur en auto-entreprenariat, en société d'édition de logiciel, en startup	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:16:49.784
cmqf8m29m0008h8ykyu22vl0l	ASSISTANT	Quelles competences techniques maitrisez-vous le mieux parmi celles attendues ?	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:16:49.786
cmqf8mvb10009h8yk5sm6yb66	USER	Je suis le plus performant sur la création et la maintenant de serveur Node.js ou de systèmes embarqués	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:17:27.421
cmqf8mvb3000ah8ykk9bastp0	ASSISTANT	Decrivez une situation difficile rencontree dans un projet recent et votre facon de la resoudre.	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:17:27.423
cmqf8oz7x000bh8ykortyjm4q	USER	Mon expérience chez OneFirst, une société d'édition de logiciel, exigeait de travailler sur plusieurs projets en parallèle en étant intégré dans une équipe pluridisciplinaires (design, front-end, back-end, chefferie de projet). Il m'a été nécessaire de savoir m'adapter à la situation et de garder un rythme soutenu de travail	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:19:05.805
cmqf8oz7z000ch8ykqtu9sohp	ASSISTANT	Qu'est-ce qui vous motive dans cette opportunite ?	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:19:05.807
cmqf8pyew000dh8ykwi2pxyzx	USER	Je suis motivé par atteindre des objectifs de nombre de clients et de chiffre d'affaires	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:19:51.416
cmqf8pyez000eh8ykjcx81pq1	ASSISTANT	Quels points aimeriez-vous clarifier avec le recruteur ?	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:19:51.419
cmqf8qrpi000fh8yk0301jz1i	USER	J'aimerais pouvoir discuter de la composition de l'équipe, ainsi que des attentes de l'entreprise vis-à-vis du poste	cmqf8kowf0004h8ykmcuf4omk	2026-06-15 13:20:29.382
\.


--
-- Data for Name: OAuthAccount; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."OAuthAccount" (id, "userId", provider, "providerAccountId", email, "createdAt", "updatedAt", "displayName", "firstName", "lastName", "avatarUrl", "rawProfile") FROM stdin;
cmqffual30001ojyk4c1rupql	cmqffuaky0000ojyklhlgf1vn	GOOGLE	112260476704772193755	jonathan.carnos@gmail.com	2026-06-15 16:39:11.127	2026-06-18 11:49:37.754	Jonathan Carnos	Jonathan	Carnos	https://lh3.googleusercontent.com/a/ACg8ocJJMOWzb1Isco4PQtgEfBk2l1YRVThdCGcwgyKCrVlCWLifcyo=s96-c	{"sub": "112260476704772193755", "name": "Jonathan Carnos", "email": "jonathan.carnos@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJJMOWzb1Isco4PQtgEfBk2l1YRVThdCGcwgyKCrVlCWLifcyo=s96-c", "given_name": "Jonathan", "family_name": "Carnos", "email_verified": true}
\.


--
-- Data for Name: PasswordCredential; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."PasswordCredential" (id, "userId", "passwordHash", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Recruiter; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."Recruiter" (id, email, "firstName", "lastName", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."Report" (id, "candidateId", summary, strengths, weaknesses, "estimatedLevel", score, recommendation, "createdAt") FROM stdin;
cmqf8tony000gh8yk4ai6pzke	cmqf8khac0002h8yk9yjtag9v	Jonathan Carnos a realise un entretien automatise pour le poste Développeur full-stack.\nLes reponses permettent une premiere lecture de l'adequation au poste, a confirmer en entretien recruteur.\nLe candidat fournit des reponses relativement detaillees.	["Le profil presente des elements exploitables pour une qualification initiale.", "Le candidat a complete le parcours d'entretien."]	["Peu de competences requises sont explicitement couvertes.", "Une validation humaine reste necessaire avant decision finale."]	SENIOR	67	CONSIDER	2026-06-15 13:22:45.406
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."Session" (id, "tokenHash", "userId", "expiresAt", "createdAt") FROM stdin;
cmqffual60002ojyk94bu4avl	b65b60a232402f9831a9b27b26178b7f1be05eaa5d77406b910e1295005ca7f5	cmqffuaky0000ojyklhlgf1vn	2026-07-15 16:39:11.13	2026-06-15 16:39:11.13
cmqjfth7m0000kzyk9xg1plo3	daa61ada47e11a439044fde4832773f4a218d6707eab27dcc8a1e186617a6578	cmqffuaky0000ojyklhlgf1vn	2026-07-18 11:49:37.76	2026-06-18 11:49:37.762
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public."User" (id, email, "firstName", "lastName", "emailVerifiedAt", "createdAt", "updatedAt", "avatarUrl") FROM stdin;
cmqffuaky0000ojyklhlgf1vn	jonathan.carnos@gmail.com	Jonathan	Carnos	2026-06-15 16:39:11.119	2026-06-15 16:39:11.122	2026-06-18 11:49:37.759	https://lh3.googleusercontent.com/a/ACg8ocJJMOWzb1Isco4PQtgEfBk2l1YRVThdCGcwgyKCrVlCWLifcyo=s96-c
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: moi
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4565c481-614a-4144-9965-7d56bb3f391f	ba2e9541f1d2d4fe77f802c15c4b64e3d4b2ddd9208617aef607a0f17afdd2bd	2026-06-13 19:48:38.528349+02	20260613174838_init	\N	\N	2026-06-13 19:48:38.526605+02	1
2cda5b71-d8ee-4b43-b6de-73f1d06c4797	e3a90972773056b81d61fbf2b07d176476dc55c2434c6938cd39a009ac7c006b	2026-06-15 15:04:03.689484+02	20260615143000_stormeye_v2	\N	\N	2026-06-15 15:04:03.671405+02	1
2a6592d0-55c0-484b-8746-0daded0a2c73	24bc3393c6ee19d507eb732170c085e2717b70a3bf221106e89463cc3fd6d20c	2026-06-15 15:34:02.227475+02	20260615152000_auth	\N	\N	2026-06-15 15:34:02.218138+02	1
c06d2580-2033-4d97-a30a-f3fa3170956c	079896783629ef52f19501b5d5b285f9139cc58c344dba3e5f15e88aea3c40b7	2026-06-15 18:44:32.727865+02	20260615170000_oauth_profile_data	\N	\N	2026-06-15 18:44:32.725685+02	1
d09bc915-b707-47ed-9cbd-7d8130e5e240	6fba17bf7d7761a310eb7c3b9b454444dd7e09ac8da6794b95f9f4b6893c3c08	2026-06-15 19:06:22.633548+02	20260615182000_invitation_channels	\N	\N	2026-06-15 19:06:22.631388+02	1
\.


--
-- Name: Candidate Candidate_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Candidate"
    ADD CONSTRAINT "Candidate_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: InvitationToken InvitationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."InvitationToken"
    ADD CONSTRAINT "InvitationToken_pkey" PRIMARY KEY (id);


--
-- Name: JobOffer JobOffer_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."JobOffer"
    ADD CONSTRAINT "JobOffer_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: OAuthAccount OAuthAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."OAuthAccount"
    ADD CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY (id);


--
-- Name: PasswordCredential PasswordCredential_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."PasswordCredential"
    ADD CONSTRAINT "PasswordCredential_pkey" PRIMARY KEY (id);


--
-- Name: Recruiter Recruiter_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Recruiter"
    ADD CONSTRAINT "Recruiter_pkey" PRIMARY KEY (id);


--
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: InvitationToken_token_key; Type: INDEX; Schema: public; Owner: moi
--

CREATE UNIQUE INDEX "InvitationToken_token_key" ON public."InvitationToken" USING btree (token);


--
-- Name: OAuthAccount_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: moi
--

CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key" ON public."OAuthAccount" USING btree (provider, "providerAccountId");


--
-- Name: PasswordCredential_userId_key; Type: INDEX; Schema: public; Owner: moi
--

CREATE UNIQUE INDEX "PasswordCredential_userId_key" ON public."PasswordCredential" USING btree ("userId");


--
-- Name: Recruiter_email_key; Type: INDEX; Schema: public; Owner: moi
--

CREATE UNIQUE INDEX "Recruiter_email_key" ON public."Recruiter" USING btree (email);


--
-- Name: Session_tokenHash_key; Type: INDEX; Schema: public; Owner: moi
--

CREATE UNIQUE INDEX "Session_tokenHash_key" ON public."Session" USING btree ("tokenHash");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: moi
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Candidate Candidate_jobOfferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Candidate"
    ADD CONSTRAINT "Candidate_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES public."JobOffer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."Candidate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvitationToken InvitationToken_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."InvitationToken"
    ADD CONSTRAINT "InvitationToken_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."Candidate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobOffer JobOffer_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."JobOffer"
    ADD CONSTRAINT "JobOffer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OAuthAccount OAuthAccount_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."OAuthAccount"
    ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PasswordCredential PasswordCredential_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."PasswordCredential"
    ADD CONSTRAINT "PasswordCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Recruiter Recruiter_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Recruiter"
    ADD CONSTRAINT "Recruiter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Report Report_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."Candidate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: moi
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rufYRVY7qfM7c1aW9RvRY3kX98mhzpojZFvXQCCDL1YgC22MXob8XlChSbcul4G

