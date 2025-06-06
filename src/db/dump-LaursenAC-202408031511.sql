PGDMP                         |        	   LaursenAC    15.4    15.4 \   �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16760 	   LaursenAC    DATABASE     �   CREATE DATABASE "LaursenAC" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1251';
    DROP DATABASE "LaursenAC";
                postgres    false                        2615    70661    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                postgres    false            �           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                   postgres    false    5                        1259    182410    Account    TABLE     F  CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);
    DROP TABLE public."Account";
       public         heap    postgres    false    5            !           1259    182417    Session    TABLE     �   CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Session";
       public         heap    postgres    false    5            "           1259    182424    User    TABLE     �   CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text
);
    DROP TABLE public."User";
       public         heap    postgres    false    5            #           1259    182431    VerificationToken    TABLE     �   CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);
 '   DROP TABLE public."VerificationToken";
       public         heap    postgres    false    5            �            1259    70662    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap    postgres    false    5                       1259    113980    batch_generation    TABLE     �   CREATE TABLE public.batch_generation (
    id bigint NOT NULL,
    location_id integer NOT NULL,
    initial_batch_id bigint,
    first_parent_id bigint,
    second_parent_id bigint,
    transaction_id bigint NOT NULL
);
 $   DROP TABLE public.batch_generation;
       public         heap    postgres    false    5                       1259    113979    batch_generation_id_seq    SEQUENCE     �   CREATE SEQUENCE public.batch_generation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.batch_generation_id_seq;
       public          postgres    false    284    5            �           0    0    batch_generation_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.batch_generation_id_seq OWNED BY public.batch_generation.id;
          public          postgres    false    283            �            1259    70672    calculation_table    TABLE     =  CREATE TABLE public.calculation_table (
    id integer NOT NULL,
    day integer NOT NULL,
    date date NOT NULL,
    fish_amount_in_pool integer NOT NULL,
    general_weight double precision NOT NULL,
    fish_weight double precision NOT NULL,
    feed_quantity double precision NOT NULL,
    v_c double precision,
    total_weight double precision,
    weight_per_fish double precision,
    feed_today double precision,
    feed_per_day double precision NOT NULL,
    feed_per_feeding double precision NOT NULL,
    doc_id bigint NOT NULL,
    transition_day integer
);
 %   DROP TABLE public.calculation_table;
       public         heap    postgres    false    5            �            1259    70671    calculation_table_id_seq    SEQUENCE     �   CREATE SEQUENCE public.calculation_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.calculation_table_id_seq;
       public          postgres    false    216    5            �           0    0    calculation_table_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.calculation_table_id_seq OWNED BY public.calculation_table.id;
          public          postgres    false    215                       1259    106879 
   cost_table    TABLE     �   CREATE TABLE public.cost_table (
    id integer NOT NULL,
    date_time timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cost double precision NOT NULL,
    batch_generation_id bigint
);
    DROP TABLE public.cost_table;
       public         heap    postgres    false    5                       1259    106878    cost_table_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cost_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.cost_table_id_seq;
       public          postgres    false    5    282            �           0    0    cost_table_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.cost_table_id_seq OWNED BY public.cost_table.id;
          public          postgres    false    281                       1259    102295 	   customers    TABLE     v   CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);
    DROP TABLE public.customers;
       public         heap    postgres    false    5                       1259    102294    customers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.customers_id_seq;
       public          postgres    false    280    5            �           0    0    customers_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;
          public          postgres    false    279                       1259    71049    datatable_below25    TABLE       CREATE TABLE public.datatable_below25 (
    id integer NOT NULL,
    day integer NOT NULL,
    "feedingLevel" double precision NOT NULL,
    fc double precision NOT NULL,
    weight double precision NOT NULL,
    voerhoeveelheid double precision NOT NULL
);
 %   DROP TABLE public.datatable_below25;
       public         heap    postgres    false    5                       1259    71048    datatable_below25_id_seq    SEQUENCE     �   CREATE SEQUENCE public.datatable_below25_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.datatable_below25_id_seq;
       public          postgres    false    262    5            �           0    0    datatable_below25_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.datatable_below25_id_seq OWNED BY public.datatable_below25.id;
          public          postgres    false    261                       1259    71056    datatable_over25    TABLE     ,  CREATE TABLE public.datatable_over25 (
    id integer NOT NULL,
    day integer NOT NULL,
    av_weight double precision NOT NULL,
    weight double precision NOT NULL,
    uitval double precision NOT NULL,
    voederconversie double precision NOT NULL,
    voederniveau double precision NOT NULL
);
 $   DROP TABLE public.datatable_over25;
       public         heap    postgres    false    5                       1259    71055    datatable_over25_id_seq    SEQUENCE     �   CREATE SEQUENCE public.datatable_over25_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.datatable_over25_id_seq;
       public          postgres    false    264    5            �           0    0    datatable_over25_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.datatable_over25_id_seq OWNED BY public.datatable_over25.id;
          public          postgres    false    263                       1259    92156    disposal_reasons    TABLE     i   CREATE TABLE public.disposal_reasons (
    id integer NOT NULL,
    reason character varying NOT NULL
);
 $   DROP TABLE public.disposal_reasons;
       public         heap    postgres    false    5                       1259    92155    disposal_reasons_id_seq    SEQUENCE     �   CREATE SEQUENCE public.disposal_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.disposal_reasons_id_seq;
       public          postgres    false    5    274            �           0    0    disposal_reasons_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.disposal_reasons_id_seq OWNED BY public.disposal_reasons.id;
          public          postgres    false    273                       1259    92149    disposal_table    TABLE       CREATE TABLE public.disposal_table (
    id integer NOT NULL,
    doc_id bigint NOT NULL,
    reason_id integer NOT NULL,
    qty integer NOT NULL,
    batch_id bigint NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    location_id integer NOT NULL
);
 "   DROP TABLE public.disposal_table;
       public         heap    postgres    false    5                       1259    92148    disposal_table_id_seq    SEQUENCE     �   CREATE SEQUENCE public.disposal_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.disposal_table_id_seq;
       public          postgres    false    5    272            �           0    0    disposal_table_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.disposal_table_id_seq OWNED BY public.disposal_table.id;
          public          postgres    false    271            �            1259    70679    doctype    TABLE     t   CREATE TABLE public.doctype (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);
    DROP TABLE public.doctype;
       public         heap    postgres    false    5            �            1259    70688 	   documents    TABLE       CREATE TABLE public.documents (
    id bigint NOT NULL,
    location_id integer,
    doc_type_id integer,
    date_time timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    executed_by integer NOT NULL,
    comments text,
    parent_document bigint
);
    DROP TABLE public.documents;
       public         heap    postgres    false    5            �            1259    70687    documents_id_seq    SEQUENCE     y   CREATE SEQUENCE public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.documents_id_seq;
       public          postgres    false    219    5            �           0    0    documents_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;
          public          postgres    false    218            �            1259    70698    employeepositions    TABLE     ~   CREATE TABLE public.employeepositions (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);
 %   DROP TABLE public.employeepositions;
       public         heap    postgres    false    5            �            1259    70697    employeepositions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.employeepositions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.employeepositions_id_seq;
       public          postgres    false    5    221            �           0    0    employeepositions_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.employeepositions_id_seq OWNED BY public.employeepositions.id;
          public          postgres    false    220            �            1259    70707 	   employees    TABLE     �   CREATE TABLE public.employees (
    id integer NOT NULL,
    empl_position_id integer,
    date_from timestamp(6) without time zone,
    date_to timestamp(6) without time zone,
    individual_id integer NOT NULL
);
    DROP TABLE public.employees;
       public         heap    postgres    false    5            �            1259    70706    employees_id_seq    SEQUENCE     �   CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.employees_id_seq;
       public          postgres    false    223    5            �           0    0    employees_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;
          public          postgres    false    222            �            1259    70714    feedconnections    TABLE     �   CREATE TABLE public.feedconnections (
    id integer NOT NULL,
    fish_id integer NOT NULL,
    from_fish_weight double precision NOT NULL,
    to_fish_weight double precision NOT NULL
);
 #   DROP TABLE public.feedconnections;
       public         heap    postgres    false    5            �            1259    70713    feedconnections_id_seq    SEQUENCE     �   CREATE SEQUENCE public.feedconnections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.feedconnections_id_seq;
       public          postgres    false    5    225            �           0    0    feedconnections_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.feedconnections_id_seq OWNED BY public.feedconnections.id;
          public          postgres    false    224            
           1259    71068 	   feedtypes    TABLE        CREATE TABLE public.feedtypes (
    id integer NOT NULL,
    name character varying NOT NULL,
    feedconnection_id integer
);
    DROP TABLE public.feedtypes;
       public         heap    postgres    false    5            	           1259    71067    feedtypes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.feedtypes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.feedtypes_id_seq;
       public          postgres    false    266    5            �           0    0    feedtypes_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.feedtypes_id_seq OWNED BY public.feedtypes.id;
          public          postgres    false    265                       1259    130920    generation_feed_amount    TABLE     �   CREATE TABLE public.generation_feed_amount (
    id bigint NOT NULL,
    batch_generation_id bigint NOT NULL,
    feed_batch_id bigint NOT NULL,
    amount double precision NOT NULL
);
 *   DROP TABLE public.generation_feed_amount;
       public         heap    postgres    false    5                       1259    130919    generation_feed_amount_id_seq    SEQUENCE     �   CREATE SEQUENCE public.generation_feed_amount_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.generation_feed_amount_id_seq;
       public          postgres    false    286    5            �           0    0    generation_feed_amount_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.generation_feed_amount_id_seq OWNED BY public.generation_feed_amount.id;
          public          postgres    false    285            �            1259    70721    individuals    TABLE     �   CREATE TABLE public.individuals (
    id integer NOT NULL,
    name character varying NOT NULL,
    surname character varying NOT NULL,
    itn character varying(10),
    description text
);
    DROP TABLE public.individuals;
       public         heap    postgres    false    5            �            1259    70720    individuals_id_seq    SEQUENCE     �   CREATE SEQUENCE public.individuals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.individuals_id_seq;
       public          postgres    false    5    227            �           0    0    individuals_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.individuals_id_seq OWNED BY public.individuals.id;
          public          postgres    false    226            �            1259    70730    itembatches    TABLE     j  CREATE TABLE public.itembatches (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description text,
    item_id integer NOT NULL,
    created timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer NOT NULL,
    expiration_date timestamp(3) without time zone,
    packing double precision,
    price double precision
);
    DROP TABLE public.itembatches;
       public         heap    postgres    false    5            �            1259    70729    itembatches_id_seq    SEQUENCE     {   CREATE SEQUENCE public.itembatches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.itembatches_id_seq;
       public          postgres    false    5    229            �           0    0    itembatches_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.itembatches_id_seq OWNED BY public.itembatches.id;
          public          postgres    false    228            �            1259    70739    items    TABLE     �   CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    item_type_id integer,
    default_unit_id integer,
    parent_item integer,
    feed_type_id integer,
    vendor_id integer
);
    DROP TABLE public.items;
       public         heap    postgres    false    5            �            1259    70738    items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.items_id_seq;
       public          postgres    false    5    231            �           0    0    items_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;
          public          postgres    false    230            �            1259    70748    itemtransactions    TABLE     ,  CREATE TABLE public.itemtransactions (
    id bigint NOT NULL,
    doc_id bigint NOT NULL,
    location_id integer NOT NULL,
    batch_id bigint NOT NULL,
    quantity double precision NOT NULL,
    unit_id integer NOT NULL,
    parent_transaction bigint,
    status_id integer DEFAULT 3 NOT NULL
);
 $   DROP TABLE public.itemtransactions;
       public         heap    postgres    false    5            �            1259    70747    itemtransactions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.itemtransactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.itemtransactions_id_seq;
       public          postgres    false    5    233            �           0    0    itemtransactions_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.itemtransactions_id_seq OWNED BY public.itemtransactions.id;
          public          postgres    false    232            �            1259    70755 	   itemtypes    TABLE     `   CREATE TABLE public.itemtypes (
    id integer NOT NULL,
    name character varying NOT NULL
);
    DROP TABLE public.itemtypes;
       public         heap    postgres    false    5            �            1259    70754    itemtypes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.itemtypes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.itemtypes_id_seq;
       public          postgres    false    235    5            �           0    0    itemtypes_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.itemtypes_id_seq OWNED BY public.itemtypes.id;
          public          postgres    false    234            �            1259    70764 	   locations    TABLE     �   CREATE TABLE public.locations (
    id integer NOT NULL,
    location_type_id integer NOT NULL,
    name character varying NOT NULL,
    pool_id integer
);
    DROP TABLE public.locations;
       public         heap    postgres    false    5                       1259    171288    locations_id_seq    SEQUENCE     y   CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.locations_id_seq;
       public          postgres    false    236    5            �           0    0    locations_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;
          public          postgres    false    287            �            1259    70773    locationtypes    TABLE     z   CREATE TABLE public.locationtypes (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);
 !   DROP TABLE public.locationtypes;
       public         heap    postgres    false    5            �            1259    70772    locationtypes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.locationtypes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.locationtypes_id_seq;
       public          postgres    false    238    5            �           0    0    locationtypes_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.locationtypes_id_seq OWNED BY public.locationtypes.id;
          public          postgres    false    237            �            1259    70782 
   parameters    TABLE     w   CREATE TABLE public.parameters (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);
    DROP TABLE public.parameters;
       public         heap    postgres    false    5            �            1259    70781    parameters_id_seq    SEQUENCE     �   CREATE SEQUENCE public.parameters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.parameters_id_seq;
       public          postgres    false    5    240            �           0    0    parameters_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.parameters_id_seq OWNED BY public.parameters.id;
          public          postgres    false    239            �            1259    70791    parametersvalues    TABLE     �   CREATE TABLE public.parametersvalues (
    id bigint NOT NULL,
    parameter_id integer NOT NULL,
    value text NOT NULL,
    date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 $   DROP TABLE public.parametersvalues;
       public         heap    postgres    false    5            �            1259    70790    parametersvalues_id_seq    SEQUENCE     �   CREATE SEQUENCE public.parametersvalues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.parametersvalues_id_seq;
       public          postgres    false    242    5            �           0    0    parametersvalues_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.parametersvalues_id_seq OWNED BY public.parametersvalues.id;
          public          postgres    false    241            �            1259    70800    pools    TABLE     �  CREATE TABLE public.pools (
    id integer NOT NULL,
    prod_line_id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    cleaning_frequency integer,
    water_temperature double precision,
    x_location double precision,
    y_location double precision,
    pool_height double precision,
    pool_width double precision,
    pool_length double precision
);
    DROP TABLE public.pools;
       public         heap    postgres    false    5            �            1259    70799    pools_id_seq    SEQUENCE     �   CREATE SEQUENCE public.pools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.pools_id_seq;
       public          postgres    false    5    244            �           0    0    pools_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.pools_id_seq OWNED BY public.pools.id;
          public          postgres    false    243                       1259    84767 
   priorities    TABLE     �   CREATE TABLE public.priorities (
    id integer NOT NULL,
    item_id integer NOT NULL,
    batch_id bigint,
    location_id integer NOT NULL,
    priority integer NOT NULL
);
    DROP TABLE public.priorities;
       public         heap    postgres    false    5                       1259    84766    priorities_id_seq    SEQUENCE     �   CREATE SEQUENCE public.priorities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.priorities_id_seq;
       public          postgres    false    270    5            �           0    0    priorities_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.priorities_id_seq OWNED BY public.priorities.id;
          public          postgres    false    269            �            1259    70809    productionareas    TABLE     |   CREATE TABLE public.productionareas (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);
 #   DROP TABLE public.productionareas;
       public         heap    postgres    false    5            �            1259    70808    productionareas_id_seq    SEQUENCE     �   CREATE SEQUENCE public.productionareas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.productionareas_id_seq;
       public          postgres    false    246    5            �           0    0    productionareas_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.productionareas_id_seq OWNED BY public.productionareas.id;
          public          postgres    false    245            �            1259    70818    productionlines    TABLE     �   CREATE TABLE public.productionlines (
    id integer NOT NULL,
    prod_area_id integer,
    name text NOT NULL,
    description text
);
 #   DROP TABLE public.productionlines;
       public         heap    postgres    false    5            �            1259    70817    productionlines_id_seq    SEQUENCE     �   CREATE SEQUENCE public.productionlines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.productionlines_id_seq;
       public          postgres    false    5    248            �           0    0    productionlines_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.productionlines_id_seq OWNED BY public.productionlines.id;
          public          postgres    false    247            �            1259    70827    purchaselines    TABLE     �   CREATE TABLE public.purchaselines (
    id integer NOT NULL,
    purchase_id bigint NOT NULL,
    item_transaction_id bigint,
    item_id integer NOT NULL,
    quantity double precision NOT NULL,
    unit_id integer NOT NULL
);
 !   DROP TABLE public.purchaselines;
       public         heap    postgres    false    5            �            1259    70826    purchaselines_id_seq    SEQUENCE     �   CREATE SEQUENCE public.purchaselines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.purchaselines_id_seq;
       public          postgres    false    5    250            �           0    0    purchaselines_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.purchaselines_id_seq OWNED BY public.purchaselines.id;
          public          postgres    false    249            �            1259    70834 
   purchtable    TABLE     �   CREATE TABLE public.purchtable (
    id bigint NOT NULL,
    doc_id bigint,
    date_time timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vendor_id integer NOT NULL,
    vendor_doc_number character varying NOT NULL
);
    DROP TABLE public.purchtable;
       public         heap    postgres    false    5            �            1259    70833    purchtable_id_seq    SEQUENCE     z   CREATE SEQUENCE public.purchtable_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.purchtable_id_seq;
       public          postgres    false    252    5            �           0    0    purchtable_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.purchtable_id_seq OWNED BY public.purchtable.id;
          public          postgres    false    251                       1259    102288 
   saleslines    TABLE     �   CREATE TABLE public.saleslines (
    id integer NOT NULL,
    salestable_id bigint NOT NULL,
    item_transaction_id bigint,
    item_id integer NOT NULL,
    quantity double precision NOT NULL,
    unit_id integer NOT NULL
);
    DROP TABLE public.saleslines;
       public         heap    postgres    false    5                       1259    102287    saleslines_id_seq    SEQUENCE     �   CREATE SEQUENCE public.saleslines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.saleslines_id_seq;
       public          postgres    false    5    278            �           0    0    saleslines_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.saleslines_id_seq OWNED BY public.saleslines.id;
          public          postgres    false    277                       1259    102280 
   salestable    TABLE     �   CREATE TABLE public.salestable (
    id bigint NOT NULL,
    doc_id bigint,
    date_time timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    customer_id integer NOT NULL
);
    DROP TABLE public.salestable;
       public         heap    postgres    false    5                       1259    102279    salestable_id_seq    SEQUENCE     z   CREATE SEQUENCE public.salestable_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.salestable_id_seq;
       public          postgres    false    276    5            �           0    0    salestable_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.salestable_id_seq OWNED BY public.salestable.id;
          public          postgres    false    275            �            1259    70844    stocking    TABLE     �   CREATE TABLE public.stocking (
    id integer NOT NULL,
    doc_id bigint NOT NULL,
    average_weight double precision NOT NULL
);
    DROP TABLE public.stocking;
       public         heap    postgres    false    5            �            1259    70843    stocking_id_seq    SEQUENCE     �   CREATE SEQUENCE public.stocking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.stocking_id_seq;
       public          postgres    false    254    5            �           0    0    stocking_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.stocking_id_seq OWNED BY public.stocking.id;
          public          postgres    false    253                       1259    71026 
   time_table    TABLE     V   CREATE TABLE public.time_table (
    id integer NOT NULL,
    "time" text NOT NULL
);
    DROP TABLE public.time_table;
       public         heap    postgres    false    5                       1259    71025    time_table_id_seq    SEQUENCE     �   CREATE SEQUENCE public.time_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.time_table_id_seq;
       public          postgres    false    260    5            �           0    0    time_table_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.time_table_id_seq OWNED BY public.time_table.id;
          public          postgres    false    259                       1259    79520    transactionsstate    TABLE     ]   CREATE TABLE public.transactionsstate (
    id integer NOT NULL,
    status text NOT NULL
);
 %   DROP TABLE public.transactionsstate;
       public         heap    postgres    false    5                       1259    79519    transactionsstate_id_seq    SEQUENCE     �   CREATE SEQUENCE public.transactionsstate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.transactionsstate_id_seq;
       public          postgres    false    268    5            �           0    0    transactionsstate_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.transactionsstate_id_seq OWNED BY public.transactionsstate.id;
          public          postgres    false    267                        1259    70851    units    TABLE     \   CREATE TABLE public.units (
    id integer NOT NULL,
    name character varying NOT NULL
);
    DROP TABLE public.units;
       public         heap    postgres    false    5            �            1259    70850    units_id_seq    SEQUENCE     �   CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.units_id_seq;
       public          postgres    false    256    5            �           0    0    units_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;
          public          postgres    false    255                       1259    70860    vendors    TABLE     t   CREATE TABLE public.vendors (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);
    DROP TABLE public.vendors;
       public         heap    postgres    false    5                       1259    70859    vendors_id_seq    SEQUENCE     �   CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.vendors_id_seq;
       public          postgres    false    258    5            �           0    0    vendors_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;
          public          postgres    false    257            W           2604    113983    batch_generation id    DEFAULT     z   ALTER TABLE ONLY public.batch_generation ALTER COLUMN id SET DEFAULT nextval('public.batch_generation_id_seq'::regclass);
 B   ALTER TABLE public.batch_generation ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    283    284    284            .           2604    71961    calculation_table id    DEFAULT     |   ALTER TABLE ONLY public.calculation_table ALTER COLUMN id SET DEFAULT nextval('public.calculation_table_id_seq'::regclass);
 C   ALTER TABLE public.calculation_table ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    216    216            U           2604    106882    cost_table id    DEFAULT     n   ALTER TABLE ONLY public.cost_table ALTER COLUMN id SET DEFAULT nextval('public.cost_table_id_seq'::regclass);
 <   ALTER TABLE public.cost_table ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    282    281    282            T           2604    102298    customers id    DEFAULT     l   ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);
 ;   ALTER TABLE public.customers ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    280    279    280            J           2604    71962    datatable_below25 id    DEFAULT     |   ALTER TABLE ONLY public.datatable_below25 ALTER COLUMN id SET DEFAULT nextval('public.datatable_below25_id_seq'::regclass);
 C   ALTER TABLE public.datatable_below25 ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    261    262    262            K           2604    71963    datatable_over25 id    DEFAULT     z   ALTER TABLE ONLY public.datatable_over25 ALTER COLUMN id SET DEFAULT nextval('public.datatable_over25_id_seq'::regclass);
 B   ALTER TABLE public.datatable_over25 ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    264    263    264            P           2604    92159    disposal_reasons id    DEFAULT     z   ALTER TABLE ONLY public.disposal_reasons ALTER COLUMN id SET DEFAULT nextval('public.disposal_reasons_id_seq'::regclass);
 B   ALTER TABLE public.disposal_reasons ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    274    273    274            O           2604    92152    disposal_table id    DEFAULT     v   ALTER TABLE ONLY public.disposal_table ALTER COLUMN id SET DEFAULT nextval('public.disposal_table_id_seq'::regclass);
 @   ALTER TABLE public.disposal_table ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    271    272    272            /           2604    71965    documents id    DEFAULT     l   ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);
 ;   ALTER TABLE public.documents ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    219    219            1           2604    71966    employeepositions id    DEFAULT     |   ALTER TABLE ONLY public.employeepositions ALTER COLUMN id SET DEFAULT nextval('public.employeepositions_id_seq'::regclass);
 C   ALTER TABLE public.employeepositions ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    220    221            2           2604    71967    employees id    DEFAULT     l   ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);
 ;   ALTER TABLE public.employees ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    223    222    223            3           2604    71968    feedconnections id    DEFAULT     x   ALTER TABLE ONLY public.feedconnections ALTER COLUMN id SET DEFAULT nextval('public.feedconnections_id_seq'::regclass);
 A   ALTER TABLE public.feedconnections ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    224    225            L           2604    71969    feedtypes id    DEFAULT     l   ALTER TABLE ONLY public.feedtypes ALTER COLUMN id SET DEFAULT nextval('public.feedtypes_id_seq'::regclass);
 ;   ALTER TABLE public.feedtypes ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    266    265    266            X           2604    130923    generation_feed_amount id    DEFAULT     �   ALTER TABLE ONLY public.generation_feed_amount ALTER COLUMN id SET DEFAULT nextval('public.generation_feed_amount_id_seq'::regclass);
 H   ALTER TABLE public.generation_feed_amount ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    285    286    286            4           2604    71970    individuals id    DEFAULT     p   ALTER TABLE ONLY public.individuals ALTER COLUMN id SET DEFAULT nextval('public.individuals_id_seq'::regclass);
 =   ALTER TABLE public.individuals ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    227    226    227            5           2604    71971    itembatches id    DEFAULT     p   ALTER TABLE ONLY public.itembatches ALTER COLUMN id SET DEFAULT nextval('public.itembatches_id_seq'::regclass);
 =   ALTER TABLE public.itembatches ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    228    229    229            7           2604    71972    items id    DEFAULT     d   ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);
 7   ALTER TABLE public.items ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    231    230    231            8           2604    71973    itemtransactions id    DEFAULT     z   ALTER TABLE ONLY public.itemtransactions ALTER COLUMN id SET DEFAULT nextval('public.itemtransactions_id_seq'::regclass);
 B   ALTER TABLE public.itemtransactions ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    232    233    233            :           2604    71974    itemtypes id    DEFAULT     l   ALTER TABLE ONLY public.itemtypes ALTER COLUMN id SET DEFAULT nextval('public.itemtypes_id_seq'::regclass);
 ;   ALTER TABLE public.itemtypes ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    235    234    235            ;           2604    171289    locations id    DEFAULT     l   ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);
 ;   ALTER TABLE public.locations ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    287    236            <           2604    71976    locationtypes id    DEFAULT     t   ALTER TABLE ONLY public.locationtypes ALTER COLUMN id SET DEFAULT nextval('public.locationtypes_id_seq'::regclass);
 ?   ALTER TABLE public.locationtypes ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    237    238    238            =           2604    71977    parameters id    DEFAULT     n   ALTER TABLE ONLY public.parameters ALTER COLUMN id SET DEFAULT nextval('public.parameters_id_seq'::regclass);
 <   ALTER TABLE public.parameters ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    240    239    240            >           2604    71978    parametersvalues id    DEFAULT     z   ALTER TABLE ONLY public.parametersvalues ALTER COLUMN id SET DEFAULT nextval('public.parametersvalues_id_seq'::regclass);
 B   ALTER TABLE public.parametersvalues ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    241    242    242            @           2604    71979    pools id    DEFAULT     d   ALTER TABLE ONLY public.pools ALTER COLUMN id SET DEFAULT nextval('public.pools_id_seq'::regclass);
 7   ALTER TABLE public.pools ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    244    243    244            N           2604    84770    priorities id    DEFAULT     n   ALTER TABLE ONLY public.priorities ALTER COLUMN id SET DEFAULT nextval('public.priorities_id_seq'::regclass);
 <   ALTER TABLE public.priorities ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    270    269    270            A           2604    71980    productionareas id    DEFAULT     x   ALTER TABLE ONLY public.productionareas ALTER COLUMN id SET DEFAULT nextval('public.productionareas_id_seq'::regclass);
 A   ALTER TABLE public.productionareas ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    245    246    246            B           2604    71981    productionlines id    DEFAULT     x   ALTER TABLE ONLY public.productionlines ALTER COLUMN id SET DEFAULT nextval('public.productionlines_id_seq'::regclass);
 A   ALTER TABLE public.productionlines ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    248    247    248            C           2604    71982    purchaselines id    DEFAULT     t   ALTER TABLE ONLY public.purchaselines ALTER COLUMN id SET DEFAULT nextval('public.purchaselines_id_seq'::regclass);
 ?   ALTER TABLE public.purchaselines ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    249    250    250            D           2604    71983    purchtable id    DEFAULT     n   ALTER TABLE ONLY public.purchtable ALTER COLUMN id SET DEFAULT nextval('public.purchtable_id_seq'::regclass);
 <   ALTER TABLE public.purchtable ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    252    251    252            S           2604    102291    saleslines id    DEFAULT     n   ALTER TABLE ONLY public.saleslines ALTER COLUMN id SET DEFAULT nextval('public.saleslines_id_seq'::regclass);
 <   ALTER TABLE public.saleslines ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    277    278    278            Q           2604    102283    salestable id    DEFAULT     n   ALTER TABLE ONLY public.salestable ALTER COLUMN id SET DEFAULT nextval('public.salestable_id_seq'::regclass);
 <   ALTER TABLE public.salestable ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    275    276    276            F           2604    71984    stocking id    DEFAULT     j   ALTER TABLE ONLY public.stocking ALTER COLUMN id SET DEFAULT nextval('public.stocking_id_seq'::regclass);
 :   ALTER TABLE public.stocking ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    254    253    254            I           2604    71985    time_table id    DEFAULT     n   ALTER TABLE ONLY public.time_table ALTER COLUMN id SET DEFAULT nextval('public.time_table_id_seq'::regclass);
 <   ALTER TABLE public.time_table ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    259    260    260            M           2604    79523    transactionsstate id    DEFAULT     |   ALTER TABLE ONLY public.transactionsstate ALTER COLUMN id SET DEFAULT nextval('public.transactionsstate_id_seq'::regclass);
 C   ALTER TABLE public.transactionsstate ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    268    267    268            G           2604    71986    units id    DEFAULT     d   ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);
 7   ALTER TABLE public.units ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    255    256    256            H           2604    71987 
   vendors id    DEFAULT     h   ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);
 9   ALTER TABLE public.vendors ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    257    258    258            �          0    182410    Account 
   TABLE DATA           �   COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
    public          postgres    false    288   ǧ      �          0    182417    Session 
   TABLE DATA           J   COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
    public          postgres    false    289   j�      �          0    182424    User 
   TABLE DATA           I   COPY public."User" (id, name, email, "emailVerified", image) FROM stdin;
    public          postgres    false    290   �      �          0    182431    VerificationToken 
   TABLE DATA           I   COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
    public          postgres    false    291   w�      �          0    70662    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public          postgres    false    214   ��      �          0    113980    batch_generation 
   TABLE DATA           �   COPY public.batch_generation (id, location_id, initial_batch_id, first_parent_id, second_parent_id, transaction_id) FROM stdin;
    public          postgres    false    284   r�      �          0    70672    calculation_table 
   TABLE DATA           �   COPY public.calculation_table (id, day, date, fish_amount_in_pool, general_weight, fish_weight, feed_quantity, v_c, total_weight, weight_per_fish, feed_today, feed_per_day, feed_per_feeding, doc_id, transition_day) FROM stdin;
    public          postgres    false    216   �      �          0    106879 
   cost_table 
   TABLE DATA           N   COPY public.cost_table (id, date_time, cost, batch_generation_id) FROM stdin;
    public          postgres    false    282   ��      �          0    102295 	   customers 
   TABLE DATA           :   COPY public.customers (id, name, description) FROM stdin;
    public          postgres    false    280   ��      �          0    71049    datatable_below25 
   TABLE DATA           a   COPY public.datatable_below25 (id, day, "feedingLevel", fc, weight, voerhoeveelheid) FROM stdin;
    public          postgres    false    262   ��      �          0    71056    datatable_over25 
   TABLE DATA           m   COPY public.datatable_over25 (id, day, av_weight, weight, uitval, voederconversie, voederniveau) FROM stdin;
    public          postgres    false    264   ��      �          0    92156    disposal_reasons 
   TABLE DATA           6   COPY public.disposal_reasons (id, reason) FROM stdin;
    public          postgres    false    274   �$      �          0    92149    disposal_table 
   TABLE DATA           a   COPY public.disposal_table (id, doc_id, reason_id, qty, batch_id, date, location_id) FROM stdin;
    public          postgres    false    272   a%      �          0    70679    doctype 
   TABLE DATA           8   COPY public.doctype (id, name, description) FROM stdin;
    public          postgres    false    217   ~%      �          0    70688 	   documents 
   TABLE DATA           t   COPY public.documents (id, location_id, doc_type_id, date_time, executed_by, comments, parent_document) FROM stdin;
    public          postgres    false    219   /&      �          0    70698    employeepositions 
   TABLE DATA           B   COPY public.employeepositions (id, name, description) FROM stdin;
    public          postgres    false    221   3      �          0    70707 	   employees 
   TABLE DATA           \   COPY public.employees (id, empl_position_id, date_from, date_to, individual_id) FROM stdin;
    public          postgres    false    223   =3      �          0    70714    feedconnections 
   TABLE DATA           X   COPY public.feedconnections (id, fish_id, from_fish_weight, to_fish_weight) FROM stdin;
    public          postgres    false    225   j3      �          0    71068 	   feedtypes 
   TABLE DATA           @   COPY public.feedtypes (id, name, feedconnection_id) FROM stdin;
    public          postgres    false    266   �3      �          0    130920    generation_feed_amount 
   TABLE DATA           `   COPY public.generation_feed_amount (id, batch_generation_id, feed_batch_id, amount) FROM stdin;
    public          postgres    false    286   $4      �          0    70721    individuals 
   TABLE DATA           J   COPY public.individuals (id, name, surname, itn, description) FROM stdin;
    public          postgres    false    227   �6      �          0    70730    itembatches 
   TABLE DATA           {   COPY public.itembatches (id, name, description, item_id, created, created_by, expiration_date, packing, price) FROM stdin;
    public          postgres    false    229   H7      �          0    70739    items 
   TABLE DATA           {   COPY public.items (id, name, description, item_type_id, default_unit_id, parent_item, feed_type_id, vendor_id) FROM stdin;
    public          postgres    false    231   �9      �          0    70748    itemtransactions 
   TABLE DATA              COPY public.itemtransactions (id, doc_id, location_id, batch_id, quantity, unit_id, parent_transaction, status_id) FROM stdin;
    public          postgres    false    233   �:      �          0    70755 	   itemtypes 
   TABLE DATA           -   COPY public.itemtypes (id, name) FROM stdin;
    public          postgres    false    235   �G      �          0    70764 	   locations 
   TABLE DATA           H   COPY public.locations (id, location_type_id, name, pool_id) FROM stdin;
    public          postgres    false    236   �G      �          0    70773    locationtypes 
   TABLE DATA           >   COPY public.locationtypes (id, name, description) FROM stdin;
    public          postgres    false    238   �I      �          0    70782 
   parameters 
   TABLE DATA           ;   COPY public.parameters (id, name, description) FROM stdin;
    public          postgres    false    240   9J      �          0    70791    parametersvalues 
   TABLE DATA           I   COPY public.parametersvalues (id, parameter_id, value, date) FROM stdin;
    public          postgres    false    242   gJ      �          0    70800    pools 
   TABLE DATA           �   COPY public.pools (id, prod_line_id, name, description, cleaning_frequency, water_temperature, x_location, y_location, pool_height, pool_width, pool_length) FROM stdin;
    public          postgres    false    244   �J      �          0    84767 
   priorities 
   TABLE DATA           R   COPY public.priorities (id, item_id, batch_id, location_id, priority) FROM stdin;
    public          postgres    false    270   UL      �          0    70809    productionareas 
   TABLE DATA           @   COPY public.productionareas (id, name, description) FROM stdin;
    public          postgres    false    246   �L      �          0    70818    productionlines 
   TABLE DATA           N   COPY public.productionlines (id, prod_area_id, name, description) FROM stdin;
    public          postgres    false    248   M      �          0    70827    purchaselines 
   TABLE DATA           i   COPY public.purchaselines (id, purchase_id, item_transaction_id, item_id, quantity, unit_id) FROM stdin;
    public          postgres    false    250   �M      �          0    70834 
   purchtable 
   TABLE DATA           Y   COPY public.purchtable (id, doc_id, date_time, vendor_id, vendor_doc_number) FROM stdin;
    public          postgres    false    252   N      �          0    102288 
   saleslines 
   TABLE DATA           h   COPY public.saleslines (id, salestable_id, item_transaction_id, item_id, quantity, unit_id) FROM stdin;
    public          postgres    false    278   uN      �          0    102280 
   salestable 
   TABLE DATA           H   COPY public.salestable (id, doc_id, date_time, customer_id) FROM stdin;
    public          postgres    false    276   �N      �          0    70844    stocking 
   TABLE DATA           >   COPY public.stocking (id, doc_id, average_weight) FROM stdin;
    public          postgres    false    254   �N      �          0    71026 
   time_table 
   TABLE DATA           0   COPY public.time_table (id, "time") FROM stdin;
    public          postgres    false    260   �O      �          0    79520    transactionsstate 
   TABLE DATA           7   COPY public.transactionsstate (id, status) FROM stdin;
    public          postgres    false    268   3P      �          0    70851    units 
   TABLE DATA           )   COPY public.units (id, name) FROM stdin;
    public          postgres    false    256   fP      �          0    70860    vendors 
   TABLE DATA           8   COPY public.vendors (id, name, description) FROM stdin;
    public          postgres    false    258   �P      �           0    0    batch_generation_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.batch_generation_id_seq', 248, true);
          public          postgres    false    283            �           0    0    calculation_table_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.calculation_table_id_seq', 7448, true);
          public          postgres    false    215            �           0    0    cost_table_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.cost_table_id_seq', 342, true);
          public          postgres    false    281            �           0    0    customers_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.customers_id_seq', 2, true);
          public          postgres    false    279            �           0    0    datatable_below25_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.datatable_below25_id_seq', 518, true);
          public          postgres    false    261                        0    0    datatable_over25_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.datatable_over25_id_seq', 3913, true);
          public          postgres    false    263                       0    0    disposal_reasons_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.disposal_reasons_id_seq', 3, true);
          public          postgres    false    273                       0    0    disposal_table_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.disposal_table_id_seq', 16, true);
          public          postgres    false    271                       0    0    documents_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.documents_id_seq', 3667, true);
          public          postgres    false    218                       0    0    employeepositions_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.employeepositions_id_seq', 2, true);
          public          postgres    false    220                       0    0    employees_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.employees_id_seq', 4, true);
          public          postgres    false    222                       0    0    feedconnections_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.feedconnections_id_seq', 16, true);
          public          postgres    false    224                       0    0    feedtypes_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.feedtypes_id_seq', 9, true);
          public          postgres    false    265                       0    0    generation_feed_amount_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.generation_feed_amount_id_seq', 875, true);
          public          postgres    false    285            	           0    0    individuals_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.individuals_id_seq', 4, true);
          public          postgres    false    226            
           0    0    itembatches_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.itembatches_id_seq', 197, true);
          public          postgres    false    228                       0    0    items_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.items_id_seq', 17, true);
          public          postgres    false    230                       0    0    itemtransactions_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.itemtransactions_id_seq', 5001, true);
          public          postgres    false    232                       0    0    itemtypes_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.itemtypes_id_seq', 3, true);
          public          postgres    false    234                       0    0    locations_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.locations_id_seq', 1, false);
          public          postgres    false    287                       0    0    locationtypes_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.locationtypes_id_seq', 2, true);
          public          postgres    false    237                       0    0    parameters_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.parameters_id_seq', 1, true);
          public          postgres    false    239                       0    0    parametersvalues_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.parametersvalues_id_seq', 1, true);
          public          postgres    false    241                       0    0    pools_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.pools_id_seq', 89, true);
          public          postgres    false    243                       0    0    priorities_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.priorities_id_seq', 51, true);
          public          postgres    false    269                       0    0    productionareas_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.productionareas_id_seq', 5, true);
          public          postgres    false    245                       0    0    productionlines_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.productionlines_id_seq', 18, true);
          public          postgres    false    247                       0    0    purchaselines_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.purchaselines_id_seq', 128, true);
          public          postgres    false    249                       0    0    purchtable_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.purchtable_id_seq', 59, true);
          public          postgres    false    251                       0    0    saleslines_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.saleslines_id_seq', 10, true);
          public          postgres    false    277                       0    0    salestable_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.salestable_id_seq', 9, true);
          public          postgres    false    275                       0    0    stocking_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.stocking_id_seq', 805, true);
          public          postgres    false    253                       0    0    time_table_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.time_table_id_seq', 5, true);
          public          postgres    false    259                       0    0    transactionsstate_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.transactionsstate_id_seq', 3, true);
          public          postgres    false    267                       0    0    units_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.units_id_seq', 2, true);
          public          postgres    false    255                       0    0    vendors_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.vendors_id_seq', 5, true);
          public          postgres    false    257            �           2606    182416    Account Account_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_pkey";
       public            postgres    false    288            �           2606    182423    Session Session_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Session" DROP CONSTRAINT "Session_pkey";
       public            postgres    false    289            �           2606    182430    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public            postgres    false    290            Z           2606    70670 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public            postgres    false    214            �           2606    113985 &   batch_generation batch_generation_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.batch_generation
    ADD CONSTRAINT batch_generation_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.batch_generation DROP CONSTRAINT batch_generation_pkey;
       public            postgres    false    284            \           2606    70677 (   calculation_table calculation_table_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.calculation_table
    ADD CONSTRAINT calculation_table_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.calculation_table DROP CONSTRAINT calculation_table_pkey;
       public            postgres    false    216            �           2606    106885    cost_table cost_table_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.cost_table
    ADD CONSTRAINT cost_table_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.cost_table DROP CONSTRAINT cost_table_pkey;
       public            postgres    false    282            �           2606    102302    customers customers_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_pkey;
       public            postgres    false    280            �           2606    71054 (   datatable_below25 datatable_below25_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.datatable_below25
    ADD CONSTRAINT datatable_below25_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.datatable_below25 DROP CONSTRAINT datatable_below25_pkey;
       public            postgres    false    262            �           2606    71061 &   datatable_over25 datatable_over25_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.datatable_over25
    ADD CONSTRAINT datatable_over25_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.datatable_over25 DROP CONSTRAINT datatable_over25_pkey;
       public            postgres    false    264            �           2606    92163 &   disposal_reasons disposal_reasons_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.disposal_reasons
    ADD CONSTRAINT disposal_reasons_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.disposal_reasons DROP CONSTRAINT disposal_reasons_pkey;
       public            postgres    false    274            �           2606    92154 "   disposal_table disposal_table_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.disposal_table
    ADD CONSTRAINT disposal_table_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.disposal_table DROP CONSTRAINT disposal_table_pkey;
       public            postgres    false    272            `           2606    70686    doctype doctype_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.doctype
    ADD CONSTRAINT doctype_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.doctype DROP CONSTRAINT doctype_pkey;
       public            postgres    false    217            b           2606    70696    documents documents_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.documents DROP CONSTRAINT documents_pkey;
       public            postgres    false    219            e           2606    70705 (   employeepositions employeepositions_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.employeepositions
    ADD CONSTRAINT employeepositions_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.employeepositions DROP CONSTRAINT employeepositions_pkey;
       public            postgres    false    221            g           2606    70712    employees employees_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_pkey;
       public            postgres    false    223            i           2606    70719 $   feedconnections feedconnections_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.feedconnections
    ADD CONSTRAINT feedconnections_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.feedconnections DROP CONSTRAINT feedconnections_pkey;
       public            postgres    false    225            �           2606    71075    feedtypes feedtypes_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.feedtypes
    ADD CONSTRAINT feedtypes_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.feedtypes DROP CONSTRAINT feedtypes_pkey;
       public            postgres    false    266            �           2606    130925 2   generation_feed_amount generation_feed_amount_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.generation_feed_amount
    ADD CONSTRAINT generation_feed_amount_pkey PRIMARY KEY (id);
 \   ALTER TABLE ONLY public.generation_feed_amount DROP CONSTRAINT generation_feed_amount_pkey;
       public            postgres    false    286            k           2606    70728    individuals individuals_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.individuals
    ADD CONSTRAINT individuals_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.individuals DROP CONSTRAINT individuals_pkey;
       public            postgres    false    227            o           2606    70737    itembatches itembatches_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.itembatches
    ADD CONSTRAINT itembatches_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.itembatches DROP CONSTRAINT itembatches_pkey;
       public            postgres    false    229            r           2606    70746    items items_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.items DROP CONSTRAINT items_pkey;
       public            postgres    false    231            t           2606    70753 &   itemtransactions itemtransactions_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.itemtransactions
    ADD CONSTRAINT itemtransactions_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.itemtransactions DROP CONSTRAINT itemtransactions_pkey;
       public            postgres    false    233            w           2606    70762    itemtypes itemtypes_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.itemtypes
    ADD CONSTRAINT itemtypes_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.itemtypes DROP CONSTRAINT itemtypes_pkey;
       public            postgres    false    235            z           2606    70771    locations locations_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.locations DROP CONSTRAINT locations_pkey;
       public            postgres    false    236            }           2606    70780     locationtypes locationtypes_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.locationtypes
    ADD CONSTRAINT locationtypes_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.locationtypes DROP CONSTRAINT locationtypes_pkey;
       public            postgres    false    238            �           2606    70789    parameters parameters_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.parameters
    ADD CONSTRAINT parameters_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.parameters DROP CONSTRAINT parameters_pkey;
       public            postgres    false    240            �           2606    70798 &   parametersvalues parametersvalues_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.parametersvalues
    ADD CONSTRAINT parametersvalues_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.parametersvalues DROP CONSTRAINT parametersvalues_pkey;
       public            postgres    false    242            �           2606    70807    pools pools_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.pools
    ADD CONSTRAINT pools_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.pools DROP CONSTRAINT pools_pkey;
       public            postgres    false    244            �           2606    84772    priorities priorities_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.priorities DROP CONSTRAINT priorities_pkey;
       public            postgres    false    270            �           2606    70816 $   productionareas productionareas_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.productionareas
    ADD CONSTRAINT productionareas_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.productionareas DROP CONSTRAINT productionareas_pkey;
       public            postgres    false    246            �           2606    70825 $   productionlines productionlines_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.productionlines
    ADD CONSTRAINT productionlines_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.productionlines DROP CONSTRAINT productionlines_pkey;
       public            postgres    false    248            �           2606    70832     purchaselines purchaselines_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.purchaselines
    ADD CONSTRAINT purchaselines_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.purchaselines DROP CONSTRAINT purchaselines_pkey;
       public            postgres    false    250            �           2606    70842    purchtable purchtable_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.purchtable
    ADD CONSTRAINT purchtable_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.purchtable DROP CONSTRAINT purchtable_pkey;
       public            postgres    false    252            �           2606    102293    saleslines saleslines_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.saleslines
    ADD CONSTRAINT saleslines_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.saleslines DROP CONSTRAINT saleslines_pkey;
       public            postgres    false    278            �           2606    102286    salestable salestable_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.salestable
    ADD CONSTRAINT salestable_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.salestable DROP CONSTRAINT salestable_pkey;
       public            postgres    false    276            �           2606    70849    stocking stocking_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.stocking
    ADD CONSTRAINT stocking_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.stocking DROP CONSTRAINT stocking_pkey;
       public            postgres    false    254            �           2606    71033    time_table time_table_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.time_table
    ADD CONSTRAINT time_table_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.time_table DROP CONSTRAINT time_table_pkey;
       public            postgres    false    260            �           2606    79527 (   transactionsstate transactionsstate_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.transactionsstate
    ADD CONSTRAINT transactionsstate_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.transactionsstate DROP CONSTRAINT transactionsstate_pkey;
       public            postgres    false    268            �           2606    70858    units units_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.units DROP CONSTRAINT units_pkey;
       public            postgres    false    256            �           2606    70867    vendors vendors_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.vendors DROP CONSTRAINT vendors_pkey;
       public            postgres    false    258            �           1259    182436 &   Account_provider_providerAccountId_key    INDEX     ~   CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");
 <   DROP INDEX public."Account_provider_providerAccountId_key";
       public            postgres    false    288    288            �           1259    182437    Session_sessionToken_key    INDEX     a   CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");
 .   DROP INDEX public."Session_sessionToken_key";
       public            postgres    false    289            �           1259    182438    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public            postgres    false    290            �           1259    182440 &   VerificationToken_identifier_token_key    INDEX     |   CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);
 <   DROP INDEX public."VerificationToken_identifier_token_key";
       public            postgres    false    291    291            �           1259    182439    VerificationToken_token_key    INDEX     e   CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);
 1   DROP INDEX public."VerificationToken_token_key";
       public            postgres    false    291            �           1259    102303    customers_name_key    INDEX     O   CREATE UNIQUE INDEX customers_name_key ON public.customers USING btree (name);
 &   DROP INDEX public.customers_name_key;
       public            postgres    false    280            �           1259    92164    disposal_reasons_reason_key    INDEX     a   CREATE UNIQUE INDEX disposal_reasons_reason_key ON public.disposal_reasons USING btree (reason);
 /   DROP INDEX public.disposal_reasons_reason_key;
       public            postgres    false    274            ]           1259    160206    doctype_id_key    INDEX     G   CREATE UNIQUE INDEX doctype_id_key ON public.doctype USING btree (id);
 "   DROP INDEX public.doctype_id_key;
       public            postgres    false    217            ^           1259    70868    doctype_name_key    INDEX     K   CREATE UNIQUE INDEX doctype_name_key ON public.doctype USING btree (name);
 $   DROP INDEX public.doctype_name_key;
       public            postgres    false    217            c           1259    70869    employeepositions_name_key    INDEX     _   CREATE UNIQUE INDEX employeepositions_name_key ON public.employeepositions USING btree (name);
 .   DROP INDEX public.employeepositions_name_key;
       public            postgres    false    221            �           1259    71076    feedtypes_name_key    INDEX     O   CREATE UNIQUE INDEX feedtypes_name_key ON public.feedtypes USING btree (name);
 &   DROP INDEX public.feedtypes_name_key;
       public            postgres    false    266            m           1259    70871    itembatches_name_key    INDEX     S   CREATE UNIQUE INDEX itembatches_name_key ON public.itembatches USING btree (name);
 (   DROP INDEX public.itembatches_name_key;
       public            postgres    false    229            p           1259    70872    items_name_key    INDEX     G   CREATE UNIQUE INDEX items_name_key ON public.items USING btree (name);
 "   DROP INDEX public.items_name_key;
       public            postgres    false    231            u           1259    70873    itemtypes_name_key    INDEX     O   CREATE UNIQUE INDEX itemtypes_name_key ON public.itemtypes USING btree (name);
 &   DROP INDEX public.itemtypes_name_key;
       public            postgres    false    235            x           1259    70874    locations_name_key    INDEX     O   CREATE UNIQUE INDEX locations_name_key ON public.locations USING btree (name);
 &   DROP INDEX public.locations_name_key;
       public            postgres    false    236            {           1259    70875    locationtypes_name_key    INDEX     W   CREATE UNIQUE INDEX locationtypes_name_key ON public.locationtypes USING btree (name);
 *   DROP INDEX public.locationtypes_name_key;
       public            postgres    false    238            ~           1259    70876    parameters_name_key    INDEX     Q   CREATE UNIQUE INDEX parameters_name_key ON public.parameters USING btree (name);
 '   DROP INDEX public.parameters_name_key;
       public            postgres    false    240            �           1259    70877    pools_name_key    INDEX     G   CREATE UNIQUE INDEX pools_name_key ON public.pools USING btree (name);
 "   DROP INDEX public.pools_name_key;
       public            postgres    false    244            �           1259    70878    productionareas_name_key    INDEX     [   CREATE UNIQUE INDEX productionareas_name_key ON public.productionareas USING btree (name);
 ,   DROP INDEX public.productionareas_name_key;
       public            postgres    false    246            �           1259    70880    units_name_key    INDEX     G   CREATE UNIQUE INDEX units_name_key ON public.units USING btree (name);
 "   DROP INDEX public.units_name_key;
       public            postgres    false    256            l           1259    70870    uq_name_surname    INDEX     W   CREATE UNIQUE INDEX uq_name_surname ON public.individuals USING btree (name, surname);
 #   DROP INDEX public.uq_name_surname;
       public            postgres    false    227    227            �           1259    70881    vendors_name_key    INDEX     K   CREATE UNIQUE INDEX vendors_name_key ON public.vendors USING btree (name);
 $   DROP INDEX public.vendors_name_key;
       public            postgres    false    258            �           2606    182441    Account Account_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_userId_fkey";
       public          postgres    false    3518    290    288            �           2606    182446    Session Session_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public."Session" DROP CONSTRAINT "Session_userId_fkey";
       public          postgres    false    290    3518    289            �           2606    125767 6   batch_generation batch_generation_first_parent_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.batch_generation
    ADD CONSTRAINT batch_generation_first_parent_id_fkey FOREIGN KEY (first_parent_id) REFERENCES public.batch_generation(id);
 `   ALTER TABLE ONLY public.batch_generation DROP CONSTRAINT batch_generation_first_parent_id_fkey;
       public          postgres    false    284    3507    284            �           2606    116432 7   batch_generation batch_generation_initial_batch_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.batch_generation
    ADD CONSTRAINT batch_generation_initial_batch_id_fkey FOREIGN KEY (initial_batch_id) REFERENCES public.itembatches(id);
 a   ALTER TABLE ONLY public.batch_generation DROP CONSTRAINT batch_generation_initial_batch_id_fkey;
       public          postgres    false    284    3439    229            �           2606    113991 2   batch_generation batch_generation_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.batch_generation
    ADD CONSTRAINT batch_generation_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);
 \   ALTER TABLE ONLY public.batch_generation DROP CONSTRAINT batch_generation_location_id_fkey;
       public          postgres    false    284    3450    236            �           2606    125772 7   batch_generation batch_generation_second_parent_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.batch_generation
    ADD CONSTRAINT batch_generation_second_parent_id_fkey FOREIGN KEY (second_parent_id) REFERENCES public.batch_generation(id);
 a   ALTER TABLE ONLY public.batch_generation DROP CONSTRAINT batch_generation_second_parent_id_fkey;
       public          postgres    false    284    284    3507            �           2606    125777 5   batch_generation batch_generation_transaction_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.batch_generation
    ADD CONSTRAINT batch_generation_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.itemtransactions(id);
 _   ALTER TABLE ONLY public.batch_generation DROP CONSTRAINT batch_generation_transaction_id_fkey;
       public          postgres    false    3444    233    284            �           2606    70882 /   calculation_table calculation_table_doc_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.calculation_table
    ADD CONSTRAINT calculation_table_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.documents(id);
 Y   ALTER TABLE ONLY public.calculation_table DROP CONSTRAINT calculation_table_doc_id_fkey;
       public          postgres    false    219    3426    216            �           2606    118893 .   cost_table cost_table_batch_generation_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cost_table
    ADD CONSTRAINT cost_table_batch_generation_id_fkey FOREIGN KEY (batch_generation_id) REFERENCES public.batch_generation(id);
 X   ALTER TABLE ONLY public.cost_table DROP CONSTRAINT cost_table_batch_generation_id_fkey;
       public          postgres    false    282    3507    284            �           2606    92175 +   disposal_table disposal_table_batch_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.disposal_table
    ADD CONSTRAINT disposal_table_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.itembatches(id);
 U   ALTER TABLE ONLY public.disposal_table DROP CONSTRAINT disposal_table_batch_id_fkey;
       public          postgres    false    272    3439    229            �           2606    92165 )   disposal_table disposal_table_doc_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.disposal_table
    ADD CONSTRAINT disposal_table_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.documents(id);
 S   ALTER TABLE ONLY public.disposal_table DROP CONSTRAINT disposal_table_doc_id_fkey;
       public          postgres    false    219    272    3426            �           2606    92180 .   disposal_table disposal_table_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.disposal_table
    ADD CONSTRAINT disposal_table_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);
 X   ALTER TABLE ONLY public.disposal_table DROP CONSTRAINT disposal_table_location_id_fkey;
       public          postgres    false    272    3450    236            �           2606    92170 ,   disposal_table disposal_table_reason_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.disposal_table
    ADD CONSTRAINT disposal_table_reason_id_fkey FOREIGN KEY (reason_id) REFERENCES public.disposal_reasons(id);
 V   ALTER TABLE ONLY public.disposal_table DROP CONSTRAINT disposal_table_reason_id_fkey;
       public          postgres    false    3495    274    272            �           2606    70887 $   documents documents_doc_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_doc_type_id_fkey FOREIGN KEY (doc_type_id) REFERENCES public.doctype(id);
 N   ALTER TABLE ONLY public.documents DROP CONSTRAINT documents_doc_type_id_fkey;
       public          postgres    false    3424    219    217            �           2606    70892 $   documents documents_executed_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_executed_by_fkey FOREIGN KEY (executed_by) REFERENCES public.employees(id);
 N   ALTER TABLE ONLY public.documents DROP CONSTRAINT documents_executed_by_fkey;
       public          postgres    false    219    3431    223            �           2606    70897 $   documents documents_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);
 N   ALTER TABLE ONLY public.documents DROP CONSTRAINT documents_location_id_fkey;
       public          postgres    false    236    3450    219            �           2606    70902 )   employees employees_empl_position_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_empl_position_id_fkey FOREIGN KEY (empl_position_id) REFERENCES public.employeepositions(id);
 S   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_empl_position_id_fkey;
       public          postgres    false    221    3429    223            �           2606    77822 &   employees employees_individual_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_individual_id_fkey FOREIGN KEY (individual_id) REFERENCES public.individuals(id);
 P   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_individual_id_fkey;
       public          postgres    false    223    227    3435            �           2606    147100 *   feedtypes feedtypes_feedconnection_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.feedtypes
    ADD CONSTRAINT feedtypes_feedconnection_id_fkey FOREIGN KEY (feedconnection_id) REFERENCES public.feedconnections(id);
 T   ALTER TABLE ONLY public.feedtypes DROP CONSTRAINT feedtypes_feedconnection_id_fkey;
       public          postgres    false    266    225    3433            �           2606    130931 F   generation_feed_amount generation_feed_amount_batch_generation_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.generation_feed_amount
    ADD CONSTRAINT generation_feed_amount_batch_generation_id_fkey FOREIGN KEY (batch_generation_id) REFERENCES public.batch_generation(id);
 p   ALTER TABLE ONLY public.generation_feed_amount DROP CONSTRAINT generation_feed_amount_batch_generation_id_fkey;
       public          postgres    false    286    3507    284            �           2606    133580 @   generation_feed_amount generation_feed_amount_feed_batch_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.generation_feed_amount
    ADD CONSTRAINT generation_feed_amount_feed_batch_id_fkey FOREIGN KEY (feed_batch_id) REFERENCES public.itembatches(id);
 j   ALTER TABLE ONLY public.generation_feed_amount DROP CONSTRAINT generation_feed_amount_feed_batch_id_fkey;
       public          postgres    false    286    3439    229            �           2606    71020 '   itembatches itembatches_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.itembatches
    ADD CONSTRAINT itembatches_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.employees(id);
 Q   ALTER TABLE ONLY public.itembatches DROP CONSTRAINT itembatches_created_by_fkey;
       public          postgres    false    229    223    3431            �           2606    70922 $   itembatches itembatches_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.itembatches
    ADD CONSTRAINT itembatches_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);
 N   ALTER TABLE ONLY public.itembatches DROP CONSTRAINT itembatches_item_id_fkey;
       public          postgres    false    3442    229    231            �           2606    70927     items items_default_unit_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_default_unit_id_fkey FOREIGN KEY (default_unit_id) REFERENCES public.units(id);
 J   ALTER TABLE ONLY public.items DROP CONSTRAINT items_default_unit_id_fkey;
       public          postgres    false    231    256    3475            �           2606    71077    items items_feed_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_feed_type_id_fkey FOREIGN KEY (feed_type_id) REFERENCES public.feedtypes(id);
 G   ALTER TABLE ONLY public.items DROP CONSTRAINT items_feed_type_id_fkey;
       public          postgres    false    231    3487    266            �           2606    70932    items items_item_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_item_type_id_fkey FOREIGN KEY (item_type_id) REFERENCES public.itemtypes(id);
 G   ALTER TABLE ONLY public.items DROP CONSTRAINT items_item_type_id_fkey;
       public          postgres    false    231    3447    235            �           2606    138938    items items_vendor_id_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);
 D   ALTER TABLE ONLY public.items DROP CONSTRAINT items_vendor_id_fkey;
       public          postgres    false    258    231    3478            �           2606    70937 /   itemtransactions itemtransactions_batch_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.itemtransactions
    ADD CONSTRAINT itemtransactions_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.itembatches(id);
 Y   ALTER TABLE ONLY public.itemtransactions DROP CONSTRAINT itemtransactions_batch_id_fkey;
       public          postgres    false    229    233    3439            �           2606    70942 -   itemtransactions itemtransactions_doc_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.itemtransactions
    ADD CONSTRAINT itemtransactions_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.documents(id);
 W   ALTER TABLE ONLY public.itemtransactions DROP CONSTRAINT itemtransactions_doc_id_fkey;
       public          postgres    false    3426    233    219            �           2606    70947 2   itemtransactions itemtransactions_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.itemtransactions
    ADD CONSTRAINT itemtransactions_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);
 \   ALTER TABLE ONLY public.itemtransactions DROP CONSTRAINT itemtransactions_location_id_fkey;
       public          postgres    false    236    233    3450            �           2606    81257 0   itemtransactions itemtransactions_status_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.itemtransactions
    ADD CONSTRAINT itemtransactions_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.transactionsstate(id);
 Z   ALTER TABLE ONLY public.itemtransactions DROP CONSTRAINT itemtransactions_status_id_fkey;
       public          postgres    false    233    268    3489            �           2606    70952 .   itemtransactions itemtransactions_unit_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.itemtransactions
    ADD CONSTRAINT itemtransactions_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);
 X   ALTER TABLE ONLY public.itemtransactions DROP CONSTRAINT itemtransactions_unit_id_fkey;
       public          postgres    false    233    256    3475            �           2606    70957 )   locations locations_location_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_location_type_id_fkey FOREIGN KEY (location_type_id) REFERENCES public.locationtypes(id);
 S   ALTER TABLE ONLY public.locations DROP CONSTRAINT locations_location_type_id_fkey;
       public          postgres    false    236    238    3453            �           2606    70962     locations locations_pool_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES public.pools(id);
 J   ALTER TABLE ONLY public.locations DROP CONSTRAINT locations_pool_id_fkey;
       public          postgres    false    3461    236    244            �           2606    70972 3   parametersvalues parametersvalues_parameter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.parametersvalues
    ADD CONSTRAINT parametersvalues_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.parameters(id);
 ]   ALTER TABLE ONLY public.parametersvalues DROP CONSTRAINT parametersvalues_parameter_id_fkey;
       public          postgres    false    240    242    3456            �           2606    70977    pools pools_prod_line_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.pools
    ADD CONSTRAINT pools_prod_line_id_fkey FOREIGN KEY (prod_line_id) REFERENCES public.productionlines(id);
 G   ALTER TABLE ONLY public.pools DROP CONSTRAINT pools_prod_line_id_fkey;
       public          postgres    false    248    3466    244            �           2606    84778 #   priorities priorities_batch_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.itembatches(id);
 M   ALTER TABLE ONLY public.priorities DROP CONSTRAINT priorities_batch_id_fkey;
       public          postgres    false    270    3439    229            �           2606    84773 "   priorities priorities_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);
 L   ALTER TABLE ONLY public.priorities DROP CONSTRAINT priorities_item_id_fkey;
       public          postgres    false    3442    270    231            �           2606    84783 &   priorities priorities_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);
 P   ALTER TABLE ONLY public.priorities DROP CONSTRAINT priorities_location_id_fkey;
       public          postgres    false    270    236    3450            �           2606    70982 1   productionlines productionlines_prod_area_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.productionlines
    ADD CONSTRAINT productionlines_prod_area_id_fkey FOREIGN KEY (prod_area_id) REFERENCES public.productionareas(id);
 [   ALTER TABLE ONLY public.productionlines DROP CONSTRAINT productionlines_prod_area_id_fkey;
       public          postgres    false    246    248    3464            �           2606    70987 (   purchaselines purchaselines_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchaselines
    ADD CONSTRAINT purchaselines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);
 R   ALTER TABLE ONLY public.purchaselines DROP CONSTRAINT purchaselines_item_id_fkey;
       public          postgres    false    231    3442    250            �           2606    102304 4   purchaselines purchaselines_item_transaction_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchaselines
    ADD CONSTRAINT purchaselines_item_transaction_id_fkey FOREIGN KEY (item_transaction_id) REFERENCES public.itemtransactions(id);
 ^   ALTER TABLE ONLY public.purchaselines DROP CONSTRAINT purchaselines_item_transaction_id_fkey;
       public          postgres    false    250    233    3444            �           2606    70992 ,   purchaselines purchaselines_purchase_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchaselines
    ADD CONSTRAINT purchaselines_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchtable(id);
 V   ALTER TABLE ONLY public.purchaselines DROP CONSTRAINT purchaselines_purchase_id_fkey;
       public          postgres    false    3470    250    252            �           2606    70997 (   purchaselines purchaselines_unit_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchaselines
    ADD CONSTRAINT purchaselines_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);
 R   ALTER TABLE ONLY public.purchaselines DROP CONSTRAINT purchaselines_unit_id_fkey;
       public          postgres    false    3475    256    250            �           2606    71002 $   purchtable purchtable_vendor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchtable
    ADD CONSTRAINT purchtable_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);
 N   ALTER TABLE ONLY public.purchtable DROP CONSTRAINT purchtable_vendor_id_fkey;
       public          postgres    false    258    3478    252            �           2606    102314 "   saleslines saleslines_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.saleslines
    ADD CONSTRAINT saleslines_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);
 L   ALTER TABLE ONLY public.saleslines DROP CONSTRAINT saleslines_item_id_fkey;
       public          postgres    false    231    278    3442            �           2606    102329 .   saleslines saleslines_item_transaction_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.saleslines
    ADD CONSTRAINT saleslines_item_transaction_id_fkey FOREIGN KEY (item_transaction_id) REFERENCES public.itemtransactions(id);
 X   ALTER TABLE ONLY public.saleslines DROP CONSTRAINT saleslines_item_transaction_id_fkey;
       public          postgres    false    233    278    3444            �           2606    102319 (   saleslines saleslines_salestable_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.saleslines
    ADD CONSTRAINT saleslines_salestable_id_fkey FOREIGN KEY (salestable_id) REFERENCES public.salestable(id);
 R   ALTER TABLE ONLY public.saleslines DROP CONSTRAINT saleslines_salestable_id_fkey;
       public          postgres    false    276    3498    278            �           2606    102324 "   saleslines saleslines_unit_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.saleslines
    ADD CONSTRAINT saleslines_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);
 L   ALTER TABLE ONLY public.saleslines DROP CONSTRAINT saleslines_unit_id_fkey;
       public          postgres    false    256    3475    278            �           2606    102309 &   salestable salestable_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.salestable
    ADD CONSTRAINT salestable_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);
 P   ALTER TABLE ONLY public.salestable DROP CONSTRAINT salestable_customer_id_fkey;
       public          postgres    false    280    276    3503            �           2606    71007    stocking stocking_doc_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.stocking
    ADD CONSTRAINT stocking_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.documents(id);
 G   ALTER TABLE ONLY public.stocking DROP CONSTRAINT stocking_doc_id_fkey;
       public          postgres    false    219    254    3426            �   �   x�%��
�0���g�8����(P�)��朆K�[������~5,c+��"��rnT�ۧ�/P��O0��Q#�=�"�L� �'�2�;�0�����,�t�)���Z�4y���}yl�3c�4��J-�v�h�0k��ɴ��.H�&�|�^1�      �   r  x���I��0E��)�%��"�d�I�;-����C9p��w�yx��W9}_�?��f?�m�Xr0+[�1�����Ɂ+�Ik�i(+�,_;�+>/�P����0 ��-���ѣ�<��8�@X	�ϻ�2�n$܌`R�@c%ȥ4��ԼK&���Q�^��ҁ�$����2d��j��P�"�~Q�M8��S�_��]�JܖKL�ׁ*G�|��f	� 4�:�QL�Ƒ�U��U�V�J_G�u����Z0�	T��h��9ՠ��L��Pq���c�t�{��?P�I\��'����{m�#3;|+�J��Y����8�D�����yz<vCZ_ѥ m*�K#ȁ�����Lr��0�і�n�+�1n6�?��      �   {   x��A
� @ѵ��'P�B��'Ȧ�U61fHtB���M��m�_����9K���&�P�iB�ˇ�a��P~��*OI����r�0�EE乎���S��?���u�t�g{X9()�tk)_      �      x������ � �      �      x����r[Ǳ������a͡�ć�O�*�Wɒ�,%���_�� $%9���������C�`�Um�䝼��i�f�k�~�Ц_�,���$����ϕm.3��BO�J�Ja��[��$�;Fl��c���W�cy��������?�b�+>:9�����u�����������������_����٘������b��`��fz���5��{���a��z[W�v���[vw1���(��5|�Ѻ�|���!)U�K��^\Eʄ��]�.��N1|��� b�Ն� V�%�fͶi	͙�3������R�ɶ`'�FhCV�6��va9�C]e��{�q���eX�W�����J ��{��9\=z���Ñ?z=��U���-ő��-n#�ZS|jftk����N��-�^W_iL�#����0�d�Cu�����ט�1;;��WVQJN�Ax�s޾D*�<!��u��r12*AD�M]����-�hw�I���sZ��e�Y(�+�Sm��{�l��X��~����mT~u�?|���ɂ�rj��rbz�٤��[-tJ�S���m�m�6�2GMm; |kپ*3J���l�;C�/om��#��@L^N����fbj�)�����h��X�v��{K���������"�Rd��\k�H@�6r���2�Z!�Q[^��5G�|�r.�*�h+��A8w�� ��rND��]�d�:@E$5�n|,+Ȭ}�q�+�^lo��V�]�ls!72���:�&�ї��Edz��_A_���oADJ��TL��z��b��U=����t�Ȧ���Z���ٞ�F�@Z<�<;��jN=�b�DSl�u�V\se�Rj`-_�9��IC��b�<$Y�<����C�⟂yE�.�Z�4��65I1��u��6e[�_5m#�w�=P*ty�T� Os���^��M�v�o�+mkͷ]N�q���?~�����?ۇ���7{\J:�e��\��jd�Hkk����Z��Pr�q�9\ˁ�a;�u$J.m��tв*���dd��C�$=��J^��4y��!ͣϧ������եp�x����C!en(�$bZU��xU̨H��H��s�H�m�v�?�����P/W[p[BZۏWVQ��V�� /��?���f��M�{����Ѽ)3���(& �0s�mS��P��K[��ceb��[>@=)�^��!եTӤ"1^�k�3�Y��H@����X��	Cw-�GA�i �J*@'L^�a����O�����ī�X"���N �I�j���Pvti�xM%�t�!����O!e�H��A���kG$V��w;������_]�rcx�e�j=��l���r�����mg��Ds���_�
%\�ҒH�����>Ϸ���q�z��*<��d���PH5�omr@�.Y��E+A��@�R0�x���>!;ʞ�ny�Nj���(s�ܬ����|�g�Φۡ0k+�P��,1%��ţ��IҢ��Ev�[�AI��ޝ�
U1X 3-Aϰ����*�ś���\�m�f$5�s8��v̦A�*����JN���� ��(Dt�jVz�_vv.��л�o��BXK�C�*i��
	�<����Yx��/��/���?���ۧ���k���/�>��ڗ7���9#���x�����+Pd��{�R�o�c��Ns���Ƚ��D�D�D�:�� pJ�J��d���(ћ%�?�����Tho6;@��bQ���2����U{5��FҶH?�8,�M~�mHk�=�]+��Zq�6�������K-�9�W(G�R���P���Y4K��fчi�s� �]�i�c	�ƨ����"����^F���=����U���Q�]����Uc#B6kv@�a��G�QH��q��#|:bU���{������,���08�w��/�o�w��/[�,�d���`(����z˦gl�=s�@y̚�W}T|��31��`i��k���K����ct��T���3�>Z�s���?ȉ�]/m����W�R$�\b���б����'�
�ױ朙����_�q*aF�b ���I��=^�YJ,�}�>t������� O�� �-*F����+Wqwv_���$�x��hã���y��;&�{��)��5o3���yG��F�9(���h�:jsѸ�@�z˽o�x�\���+?ӦS�*	b����F6_4�9�&(�TC���a�����i|�}}���Zo�A ]R�z��0p[�ʫ�<�J@0���^ß��z�
��ԑ�Լ9��{�樳#M�o+5���H��,��j��9��=�UG\C���]��"�`9A��:s������-ԏbK�f��]{%5쒿�v���=� ϙ�6�;�e@�����n �P���WO8��<Z���+�����u���/��^�%��o�އ
�iw e!�w�_Q�+�A㲊�
����ί�F���Dk���nTObj�AHQMn�)<����k~�*��=�����%_C���W�O�u�aЌA������iϹM�	�{�~�V�%=Z�4�Z�uߙ��=��i��ADvFC�$�BR�H�l(z쫳�~��ϥ�CVP��Z������e+^ϳ�2it��|����B�4��V����;�~�������B�?�6����f?w����9/�����j�0�����^�r9�����V�>:J�? �^��f?w�Kp�� ��<uR�r6#.l
g4���{�+�Vk�g����a�B83Hd�Z�VE!���I����b��X8��W�89�b��cld����ίbK|J�BK�DJ��]4b�-�:ky��ե-�p��ɦ�<��}��<<�3n7͒��{�}�ơ�4z����Td+����B�v~�i!c� B�ۑ�E�QV�<��\Y($����A� ��"�
����_�����O��}���~�2�|�S'�)�SFB������H%P ��)�9F�A��C�&���������
&׶aNUy��#���*��A��^�+�^�t�@�c���?b�z:�����/�Z0�v�mo�L�$�k�:����Y���Ό�O㞠G�t	E�gyX@���jn﵎��|�w�I���8V�<0�����rOr���X��ܼ��t< �E�i>���Ac� B�����~��|�`�������b�ӥ�=<���Q�ﻀ�DE� ���&�O�(�#}�C�M oMJ��P��XEz�a���WM�	��>�{MJO��*>C)yUZ?;)�}GR�xV�P��	(�bl�H~L����.�5(��I���A~W��J�^� �����`c��h/k�1\m�nC�6�V�iP�������AM{��A����r9���.��N���+6 {/h�7��{���yy��D�?0��{P��b!�RCx��NS$z���6xBx�y��xoMP�����<����]�ҩ���6t$P;J� �4��.Hd��(HN�(>���r��͂�^���f"�|�ʆ���:��F�FA�'�R�}�(�<:�#+��(O;5�gDk��#2`�Q-gz^�:��`�ϙ�B��ܽ���&�dINӥ��ň��*��)?}t2HyaΫH����mӳ�O^�(�n��>N�2>}��N�u�ݛr�Y�`����)#y;���&��H�d�#u4`�B��8�F�ʎזc��{$�K��J*-	mm)?���h�N�t���O;Mɧ?t���S��˭�7���يH�<��;�ػ)z:��+�4N�
�[�lNx�ײ;D<	?ؼ�w��Īm����[�Kpz/�9�H�ы�mA%X��[I;�g�ַw�@��ݡ��6!%=`Ôث�C��P�����t�E1ϊ@'"�j_�DR�����_��U���ʢ�R��4�w�#�D_
�G"��������CN.\�+ȃb��aM<I��R����8$��1�\�p�M�5���Xݷ�t|��7�P��<V�YEV*�'.t)݄p���o���D��'�t�,��Er!�&S,G�/uNexl���0EEf��J�+�D�v����[�$ԺS@Y�<��� �
  6���G�iSk��\���q�5�:����?aw(|���}9�c
c��V�� =ݬ c�Á.<���"�g-��҃��q񡅾��!�r�ut;��=�&�Rv��^�S��Bl|�
'��s�F���ˋ�u�t��^T�_��Hz~��)h�Dp����%6�$��s��.�K�BQ��+v0�!Q�W؅�Bm ��v�z�=F����?�pC���������iB^ ��wX��Y�@�a��+�ޗj�s�����M�7������AJ��ɞ�ly%��?�U<��w$8�6A����ѳ���
�+%.�j\<�ב�}	�:�sr��
�������)1cn�@[3��:%��:�e��5g��<[���<)�f�'�%]�U���U���;���A�(�$#��`�nr�M�~����W�������ꃄ��P�^�Jzh2�2�Aym���N��Q�e֨F���3��
Q��W�5ĵH�8�ov7<��) (��u<�#z~����6��B�@$�Ш�Jk����
`��"����z��[=� �H��Y�L���> ز�C��W�����C��:,��F�_?�>�����nfh
^eM�v�\ǹ�7(\���3n��4m);�E,���cd*/�C�Q̾ڥ��v�V��}���H7!do��Vd���>^�p�J�'e�o�Lt���F�V��1WCU��_\��T��\N1��=�D��S�� 0���BR�:�)�����Ӏ-h���j*��w
��G��g��>_��&��w�8O#�p��d8Sv(z���G��8lڇ�C9)8����bk��vR��h�\��=��NM�n�H2�/�߭"8�����*�)�X<~�4�5O������R�8GrƧ����aSC"��l5�aA��5@���-?���'"g*=�c����&��G�Q=3��>�t�L�V��[n�L�˫��
�]��b/W�0��eVA2<&��47 em���%Ǟ�R���)�$;sDCb��^��4t��#�Rw@^������_`:�u�X��ه$���Wk(ΞU��G���u��.w�U�"�m��r0��!�o&A��E#{=���m�z�'�_ᐅ��;	L�g�j������ӛ����qŝ%��Po2������ȘK.��.�\�P?�4����]Р=�V�!K]w��ɒ�ɵ��o҃��zJꣷ�d� �R��hT}s'�lU�Qs-w2&ڊk��m����z޲�gA�ؔ 0��U&%=�m&(�b�V>,�F	�ۥ���3,d���0�z�TH��:b��P�#!����~աUy�y�x��ڢ�/��c����7D\��6��Z��^i���K�<�3>D�	~���w	
f	�� ��,fG�iV m�.|�Gڂ^�$�ƾ�M�@M�)>;��d]�o�oOg��5����`��U��n("C�n�$����M�#o[v�c�h�4{���Ssw��q��7i"C�(b��jn�`1~�~㷇��茻�bɼ���	��`��;q�;��<�5Z�߾�JWА���S��{KA��oVm=���İ�wb���˧�o18~L��Bʗ[�,�#�a�Ӎ<$[m�#}@*���w����ԑ�?n�MRȁt��TC����q���2y�G�"Ⱥ����O�I���&A��\|{�E�\�Lt�vF�ލo�S���M�,Ё���7LV��� tX�L��Sg���������pSD7�O%ϫ�����	]�_� O��=���|�B$<]z���h���l�[2��vP���NՁ
�h_K�Yk9 I-�f���|H?G&�l�~Y/��aw!�F�kN/�n����	�݆*J��~���@~��n�P��A�lU�q�0��׎�>mo{�2�#.;Dl�5����妤q�4f�[]]�r! ����; �㝾��`���ğ.a���K�(��[�&=�ͪ���ytG�z;j�1 ��� ���D���]��	P3zx��V8�������%]����V��[G�OJW�,:�ªFF�f��aw�B�Ƭ�%tD�86{��>`n��y[J�C�c�1���W�/J竏�=�u�G���Kt�z��4�0Y&�JB���e
�7(t�B��u[��/C?��t/���U���=濬���M�,{$�e�q]z�!���v�����s��� ����al�C�ZU:������}�p�S�\@���t4G�'��L��F_�E`���zg���G9}���s�Bm��W��&�$���1|~B��ᤉ��];���}��(�v���3���Ch�����*��Έa�ۢ�ם�<�a����f�=��q���1(zy�t�����*�x(�|Bc%�>�ii���0����K�eFx�4�EZ����jNW� �U�����z�U�X���s�{�T}�AO�oZ��#N����RHa��ѩ�B��B4U�{��l񀯈5a�}BS&���H�.R��Ar���'�S,���¬YO[��~��`�Hio:Gô�O���b�/X��s��t��1���YX]^=��:�5�' Ϯ�96��/mz<�^,zr��_�X���i6�W�u Z���~ԝ]�Ɉ�ޅ>ϻ�zF�E�������1��2Kb��o84�#<wG/�<���6��Jh�zW��F�z�ܾ�K'`�S��m���f��	�ؾ~������mM�Y��~���[�      �   �  x�e�ّ�0�o̖u�P���vc�˨j�y#��Ȕ2G�>��?wm�L][;�J�g-O��!g��V�m�V�7��ҿ�� ����;���b���{ԧCJ[�Q/Eۡ���MtV��u�B��K�R��_ʴ�����u��s�����GQ����Њg_�x�%q�f�"�9��x�efdO<923rffd$DJ�2)iʨ��4eTDJ�2*"%M��4e#Ӕ��LS�22M�H�ɛM����1��̊���Cf����<v�:�hE1��w��yڛ��o�]G��of4tb�s1�V�l���\�@�Sg݊ɭ-����Ku�C�R���֙��Q<:���ߎ=��F^���9���ï~x��t��#x�G���=�qg������F��7      �      x�՝[��8�D���R:|?61+���c�rI����3'��23�ႉ 	�����B�ە�C���§�z$�ѿ�Ͽ����%8�[)����'���c��G�>1:�����?�zx�?ܗCϛ�
K=����O!���I@s!Jh���O���SX�G�z�.�вĶ#�]m=�� �ﳘDm�hޗ���V$2="�ru��D��D ��~\�!����ţ��[���3�Y@Ԑ���гs����?�~8�͜oq�?�QN!�����K����\�%&�[Z_əŬ rjG͒�\n�tv]�8C^��|��� R="'�!����^��>��Aɹ��=!�z|G���Y#�bs�����z�h'�ꎪk!�k�D���/�H�!-`��Yʂ�I͏�Z��6礗%��'=-�C��C?1�tHx��Kn�D�N!5W����^%搜Y�
"�&�
�Ni��9�&T!%�p�R�D�����.	�WM�D`���9I��>�� 1��C��1'�u�|bMR3�p˭�'ڄ���w'���Z��59����=����z�
	��,(���(��^�ة�A�4�lg���E�η�$���h>�&����O`&�&t���yv<�����l�=n~�*��t��ռ�}�8w41Z�{����,�~�N�4w�`+�E�K��i@H�,f�?�޻��5C��CC2ܕ��nu��Ч�4$�w���!K�4H�	�v<|�>��k�m����Gы$�[K����Z�Q�]f�nF��Ld� �臞�D.�z�����bVE�G��]vA�'֎��I���� ڮ�E�6~el^����*.U�D#4�YQt��8�h��C�Q4 %�t�f~�R/6��h4=���~G���"���K�þ�0I�4�̮��KY��I[y�zc��`ج��P�ۚ�ܚ��)Eм�zs��QׄCbf)+�,Բ
|�M��&��>-�p���!�a3>C��rs��'�,I��r�����=Y!�����9@`�n���w�ΩA�Y��>'�drv�蓚�R'Q�t@��u�j�f�1O�A:0�⓪�qvBB%w�˧Fv�ޘ.�1P4���K���&~Q?��ǆi���t۳��z���U�4��#���'�r��~1���,kg:����R��̍-�~�	���<1���Y�B~�/��+��$�#[dw�u��g D#�8����y����p�4MbVR^��:
�nPh��Ч�8�wi�b�Z"b�ZrE.!sK D��eb�"�*�3�YAtiU�2j�!z_Mƈ�$��m��-���UN��\�d��eg�Ao�� �3��"��9A��Y�GH�l�,����2�p�� s��7i���$s��V�q�x��HF�H�/���0DSyu�,U��+���b���@(BQ�99��Ć�w$ȫgrH��36���\o���e����麢$TL�ê��B�P֠ɛTh�O��*%ġ�2���b�x�ʟ�l��H�ю.uUGT�J�@���3�Ѳ�����2J���c/H������IΊB=$J�,���]��BQ�&~��꬗}�d��KY�?t�G�'���S=�X�#r�Y��g���lEA�B��V���i6	��\"Dɦ�?�ģy�?Q{k��b�jf)4�����0H�,e�J}xq�o��҈�A�X:�]�ŰG�`H���N��Y�t#;W�������+���&��_×�a؃X�4w4k+d��i��u����B���r d��O�Dd��F9Ǌ��a�cXÐ�❭*`1��)�=�YAt�})���G��j�hU�5��3�=�5�b��=�J&����:�Y}�R)�ӌ&fUd#�V,,���������o�r���V�}�:9+r'!+�vG��||7Ś2�ВzB&m������ �l�%= �'����,&1+����c�����,;�YxI��n1,(D��{h��}�:��|�IΊB�vY��B��lAS,~�1�H�5�X�H��F����*1w~t#�����Y�������-��#��EL0}KHxo�'=��b�8C�J�,������@�s�<Ae�\d��l�Z�6r��
ADTؼ�F����W#���4���
��^[�+ɗSG)��,!b��D=]���EsP3|�=�+�9�K�׫���I'"���e�`�bcMх�iS&�g	�͐7��;�2Q�E�]�(�@�����hz����^Z4���L@�Ig�5�Wr�FLS䌄�d`�>*U\Z|�7*��9'G�>�D�:�����UK/oDn�_�5�";�� /����@}m	2���T�v§����=��-�T0���F�@~'w@�+fg�5U�P�Qi��0 2��2bt��[�Uz�v�$/�~7���P�[\�����Ie�>��umu�9M��m��ޢ!-��6�1}�8 ��9	ch���9���c���cN��� s����/�?Ȝ|!�A���O1'��I�s�I0sn愍�>��n���]Hm=�1D�fV���U&JO7�O�H��sK8D���3��e�/��ŋ�5(�h��I>M�P�Ď���ȴt�˩�����o�%�; whuš����'�/Cq��>����؟E?c�E|�-���z���������=s|g?��	i�H��Z4�������~�f��Ͷėrd2bJ�]�dÄ�����e�T-�쀵!%�P�1�����7��	p;|�rM���q�w�""
�F�[�h��m��h�w-p�+��A�1�y~��*C���'�*���	�!Z4�/N�A���<�q��7�Dӧ}�Ċ=,�-�ckq�Hɲ�$1�V��ܑ�٭`U�YN�!�"���'��SINw\�Y�'��7V#;�K�*f��Gg�M��%ޚ%֦��,��Y�0�����?�fz_���޶J����c�HY!T~���͠O��B�X����^k7��
婍M|��:)j��%EB��,jF�l�nkHB�-ߋ����;l���F�0=�ԫ����{�Z�ߌ�kskQ�N��ι�}����������v�.��[���}���q�影/�9APӷ\��
SK{h��|}f�`���==n�e^>�"(/��-R��(��i�����=)N����HډL]a9���'w(7;��jɍ����0���� �o�I����<���)�-�����g�ӑ�7��3�	oZ�v���MDؤd��d%��O�7+�Cxa����>��S6�m?�l����;4���Z4Mj��d|c�f���W1��ʮVv�H��c�'��3i�Z(b�O�^`�Uzh)R�%*��C.K?�P�F��id��'�dai}4�n�^Է��I UF��-sہyhI) �f�6��i@6�{p�މ=ÚNΠTP�����Ʀ\t޶�a:�(�txo�0��$u��o�5�{�^HH�\y08kd�e�t\SWt�_���%I��&9۳��d�,�c��Ȍ�]A��;��:�ۛ�zk�tYUrHr�O��ɶ���%~à��w�WTX�ӧ�8�SR��ۮ�= 2��_�_�r��3����Se���zy%x`.�����*8�/�o�:�j-�j�L�̋-i'�W���L���_,ۦ@�O=��;8H��}=�$w�/u}͘/cb>�a�2��NJe������"N�b�*å�
�������ǚ�E���p�jVY�F^�T�|�#y�b&y`����'f�ܴf��ŜW���w��M�vAl����ir�Y�HSs$��$�!&W���"�$�&yw9�:w�bS���n��rpX��Wt��c���D7�:��R��)%).Q��ВxU�?E0���70cT�lTH0ȯ�;�E�DjR*�'�؎A!����h��xbN��gn-���D�)9Ю�݌iI�i����a^�}-�TP�W��)���Pi��m�q_����Ʌn-
��Z&���7�'m`_�e_,�3����佷d�JV'y��S102y32f 8�᮰��mI��������ٙ�	��x��Iy����-vhzݰ�և�    gǲ�8#��@�J��ܪWW�)���-xH�jX��đF��i
g�HI�	����̯f%7$�K��(BtTӾ՚��G-RBM,1Ddm[�0c��p*�h��fO�x���\�C�&B�~�LisM,Jc�T�?XBV�~rS �р[)Z��x�t��G�\v+3�s�ߍ[��K��lT����Չ������5uu\�،8oL2 �B���Mf�����*ѕCF��zɻ���H�;Nѳ����_�j�&�m�pH�_K(crkK�˚B:��s���f��8����9�"AZ�z#�&O-��3�?���g�_�de=����X���,-!�C8[�8��pk�Ǣ��X6�6���e�����}nL������'_ս�N��͢�B���	�bɲ,Kk��%t�Y�qS�&v:��9��6����i�?�<=2{�sh���[nsh��B �;��v|�_�ؔ����eR���*��[L��e��a��q�A~%� �XL��\�$S��.-��T��#����Z-�����w���� �4�t�x~�^��EJ�X-*� $ط�k�Dn�əb�{y� @�n�� _���Ƣ�������8��u4�qk��N
�5-[ `�_���i{k��^�K7�� z�R����V��ᅥGg�NvXS��=,7]�y��.ˍb����R�9t��B.�Z�9�2����7v�_���X�{���G���8�0�u3'c�&�3kOC�<��Y������խ������ޘ5�[��b^&[wg�l�w[��<(�ggT���#����k�ա�(�Ery]y u_8����s><�(����x3&ٽ;G��©x�:��鞒.���s�-�����\�7[��K�qi�����9�����Q2
�48D������⶛ ���%��PTΉ}΄�,I0t��=<��CK:�f[�>��f�ҫ�sFR�6�<��w%���f�W}@]�[K�Z�.�!�k����WRG,��pk��8����$r�ْ���BQ�հ`x�n��x%u ��'�q3�;6�}��>�7��{�|�ͮ`�������3	�)��l�b�-���S#rf"��W#���̾d���9�/��k��K̾(N���3���be���5"���Nw�i8��e�
�^-K ��v~r�s�{�*��0�uLH�d��^e�F���8}�����(��V9uk���*��Ҕby��:��3G��P�Z(��1���}��[f�3�ZDM�����j+8LyJVj�����x_���w"������?Ğ'���)� [,{�o���{���+�	�)���y�|d<$Q�a���ۚ��?skI[�@��<m"��D}�r�Y���Iu��A�����PR�STt�]s$Y�i��l�8G�N"pr�v�� ��f��Z
�0bqd:k�<C~�D|'�\u�� N�9dY�<����t���3����egxn-����]{�N���)����sٱ��dmr�lU�� /�u9�V�|�l�{�e�[Ԡ��9�.(=L��{�;x!vlrN�NY����8i�^^##�ȎS�tI�d^#���E�=)m�g¢�O9|��C�)��[���N�bT-j������9�NC�qȾ& SQ�(G��E\N�_*�[������V(b����q�N���b���r#+�YJfo�N��bX�]��6��zA)i���l����hD@U?���,_ߪj�ã�[)�@ɩ��G��)9��|j!�cC�?%e�.�!�}�ƒ���R���Gͬ�ș��H�s���d�Y {#{EM2�F�f�m?JsW���_�����v������	yۡ��O�[\g]ٳ�W׷�Σ���SC2��-�+. �}��J湫F�6���ϐ�X�)͎:Pt�[5?Jɑ��� i6;} ��[)��m�*j�H�(��i<Rj�,������\��P#)(R��&�!a,���B1}T���I�����<�T���m�o�a���9�|۞�爛����i~)�ɸ�rIS�<q�X��U�|C�7�%���+�����[S��Ӭu*�yD�8{Z�+��Z`= �D�q�d����������{�юoT�܀u��[�t���'�#%�2G��O�c(������ހ�TXSgS&���z�A�oD�<GM="�a�2��ע$g�y�|��7�#U��8챵`���1��b4��t����R�iGl�T��v�c!�3�X�C�M&+D����I~Ɏ�/����c��f{|)�4�oX�ޒ�M�.�ǜ�1x�� f��v���E�B��ܔjq���蹴&g�n�yԽ��x�-}{0��~y�*H^�;9"�����

כ��GVI�� In�@kVϋ����{�2�숳FYI���,Z&\�d��wVF�EJ\y%��1����?1�S�:�ue�3�H��r��P�J��a�@蜪‷~*�e@�L�#��,�� ���]8!PBKLN��Α�T�q�A��Sw�TMRV�<7?STf���<�_3F�X����̧��� ��̾6�T[�}lyHT�`��)�?�k��9�q���l�6M{9����>\�9�N��c5�:*V�|d��h^3�SN�^RV-�+5Y}����LBΎx
��n^m0����*�T�}�j�,d�j�Bɽ�/HJ�P)!�I:�,%�* XL~9�=EJ�`u����2���`� )����}�ե�( ��Jy�t*̽U	�C~$��I��VY����쪦`��)�*L���T�>��NU�5�8"Z�Klr:7^��O.ϼ�����Y7\�^�[XX����>�Pb���d�--�ڈ��������Sъ�r���b�t#�hĖY��5U��o�-/R6b�Ƌ��mW�\=���8�Yf7b�Fl;�,RL��l͘-/R6f+�E�d�j�11���r6+���pc�h̦��G�~��gf+����tr}�
�1�&c��2k�����DHD�A܍ٚ1[[���B��=8��Rv�Dyf�[	�����lј�A��}�r2��͇E��lv��Jg\�JAy�)��ÍX����K݉pY݈��A�֣��|#�ʙ�L���C�(d7�������m ��e��)��oȥ.RVza�O7gΊ%ыf�TU��qX�腝�-��L��������8}x\�?}ԍ߿u�G�H\��l���հ~6,�=+p�l�Ť�x|;}�\��p��Q������}7��o��nY;i��l]?�X�L������`�?8�ío����8������0_,��&`�wR��E���O���o�n�c�J�����٣�j��Y?��Û_����5��D���M�y�ɦ6�U9�^A�͎jw \l����,1�,n���L�]�Q9�����_ɐ�x�2��N�<j7�M+s����\���䠒U��G��o�¨G�����`�l��L;��+{����P���a`�X�o��@�5�P��{b�I�̸�����?�e���p���L�չ��.
��iޕ�I�֙��d�&�u�<��TC[�Fqǂ���ZK>�v��P��Q�[t�-�gn-��jm�L���g�m3S�J��w�I�2�]��
�K��\���
��CK�j;��[�h O1����v�nv�´����U���L(/v�5�������>i�tX��,��1��"������>/NS�(��Þ�*q|k��V1k�,qW#u�J�����:�gѼ�-
�BN�a�m-Pk�Ƃ���+Թ��c����b_?��DQ.�mh^�B��.��*n�"6��\$O�b���ެv��y��\����Б1��)5�:�T}�B9A\����,�j�m(@�a�R�_X����Yl��H�K�Wb��u���0��"]��'n�£���wS�a���S�qz��^�Y���m��9�g�)4��8��ف��Ű�o�c���{e$�'�*�U�j�A��z�6�b�餘�������qGu�sKO\�)�ѸY�*,Q����!���(JD�	ym��O�: X  7��u�mP�b�eW��z/.1��'��JJ�d��Kѐ���N�|�e��ơK΂��Ԧg<Qd}�h�[(8?���5�67���D�S�Ӱx�O��@���<+T/๬�����mO�� ��E��AΈP�I�&(�ܐ>�.��L��B�S.�k�SJ�6�Rd�)�G].�ƮY��t ��cRtxp�`E�d�>�X��r���>�r�x`Hr���ɬ��d�qL<��]'�d�h�]1ӎ��@�$o)v� ?ՍܒU�u\��]Tw�P�Nnv7p 5��v	��^N	�V
����<������� ��F-�N���ҍ��əŬ jb7Jf��{�9��:.�v[@l�6@�C��cQ�Nn����%fAU̓�3��C�@%c+k$5]+3���)��� �+5Na���{+6�YA���Xܦ"w:pQb�R[.�@l�6@p���>K�ul�o䆱f� �bV�Zs�|���o�J�&�sVr����@�(;�,?S�����q��T��Ζ#sL[;?$��5�l˞?ec7�����q��ஔ��`Ձ�03�s(a<r���O崶��3��q�\a����>�iQ<�Ņȝ�C�V7nB*�0\헥�v wn��X�����aq�G��e�r28�%z��G��c�Ս���hP _r�d� dj0NB�i��q�R�ȏ�S���Q�[��-�|u�z [��_�}7OZ�#ϧh�����@::�@�3�������Y2t:�{��n��2�rC��z���j�YȊ�*2PEPs��u��Y囘���.�6n35��6:��;�Տ�ꋔCkܖC�h� �B�Y���[zac�l)�\�I�*.!,���Ahm�F4\���ȵ��V�X�p��Z�3�����-�AJ�`Q\k��d�,�����f��C�RR� �����UvJ3��[�5��]o���P�,e�(�M��=�0ՋD%
�*�fM���&�;�	=!�$NQ�(ض!�s�D]ʖ�T�m�v=�S{ry�*�+���ܙ�6���ʸxR��-���m�fB4I(#��H����t���(��[�c�q.�mbW�]qE=�Bk��7֮1���U���<3��]O,C��*�����9vPY�]����Ү�m{>p�#/b��|s���n��NDu�ݐ��pX�A��F�]��A�.G�]aͣrc3|Ѓd�I��A�Zc��?W����g������D��-FU���gZ�Ŭ 2��X7��Mk�Elu\�U���U�N��"�Mr�<1��,fѓe^Q�߳��]ڶ�ѸSk�I?���O'��398�.}xb5���Y�����	粼�U�Xy���G[t��r\�)K�zŀ=[�ԓ�E���8����v�0�Ѣ��#��W����m�$o���aNrQk�\���s�ǞԶ?նx��Sar�6��Id՘;V�U�Dg�r��}� ��v2���,R�i��+�x�1}L_�U~T��m���B������|u�&j�=��\�pI��Q��V�����f��М�7os� @�}��mpF8�(���ƚ��Pf	�|i�1��R3����K=�S��ܾzgթ�yPր۸��4I��:t�M��^-���nG�s��C����R#�#��C5ݾx70�Y��uG
=��.�B�Ĭ�����e���J
2��HiV� ��;���E�/" W�4�u�/bfY,���!�Wjiz�|�L�Ig�#?�ڝ;W1�EM��x�Lnf����#�'�+JD�M����Q|��ľv羫�T�Ӥ��{�L�|��Y@$�Qc8��x6��Z�T5ŵ'n�w��a>�����YPpe4k7��ǴR�?����3�Пꚾ;�tfܾ����$����i�qr����!s��$j��=e����"~�	�p���S�f�_��H�̒�W/A	�dw,�����6�8�JiC9�O9��,b����:��[;sF*Õ��$�̴:_3�eY��b�A��� ��n���(���"�caIK�
˩)�[;)*�[�Ɲy�-Ԩ]��Y��{';�4�i�	7潷Щk����.�7+mN 6. n�{o	��Y�, r�6��w�FZ;O 626w꽷.�^�, ��9�V<}��	�F�čz�-�t�O̖�W�������5';7潷p�����8������
���(�&�[5�`�e����Fl�S�A����E�/�X"�DR�LC&f��!��f����/~K$.�;f2j��7jV.۾U��H���IGdw�.�I����[������M��J��8����������Jo9.���
�6%�X۱��Kl>J�j�ޒ��l�i�X��W�ua��S��3�8���f�b�͝�RX	��!V�t���Nn�"f�����T<<��w*�;��81�����ޔ�UQ�m��P:�U��Yz�i��p
^)�x-K,+�����/:�-�پ��r��`�>��}�J����,�����-^*� k7�34졠! �w��}�69��'��fαL��Bp�g�\j��#�&�Zcj2G�5�5A8���Z#�us4�je�̲+̀����e����b�a��Y)n�9�m�XC<�D3+�3Oa�Dv;�se%��b��`�5�	a	�ݽ�b���Y��H�a���Y��'s�-]�/C�� ��f����qe���1���V��"Zg���s(�K�˃�q�g-��e�G.�ЗI����Ù��$���ޮ����b���Ð�VB��C<�E�B���Ỽ+��,V��8�(�$�d��H���'���A��̙C_=X��b�@�'|b��!�J�{��b�c�v�?@Yjn�*��z��G��!�X�, 2i(T"Βг�g�$�;35��wټeKU�� ���qr��)Ĕ0��n�0�,faW"�J��u���me�C7���3�}���aq�Z� �d1��?��Q%qOrV1���v��;�]e[3�M�"7�A9�r��wڼݢʕH�~o��|,�ES5�u��NH��JY��<; �����6?c�:'�ڌa�k�x�����ā�,c�8�!���,f�|n���EY���Mq"N�tB���f�Ad�h���,&ۧҳ)/�V�_嬆'$Vh�B>�-��Hv��B������r)*[�.���>;���sc�$�}�B��.�T�XqtYƌ��l�N'G
���0U����������	�!�@i	�nrp�QWr{���� �/�mjj5Y_�L��65l�W=KY1�:X������P`�(�ǝC�Ű͌6��B�3�}�����$d��7�m��߬�^a�o�~�!l��-D<�(���o�n���,e�����sI�)�,.5��	!s{�6c��EI���j���܂q�tU\Ĭ ȉej��FZ�f���V�C�7�E�<�6�w�̿�V㵳܀�M���¶�x*ntڬ��P���r=fBM㬚�s�m��Z��\v>��u��~�9��R��w7����"d��(,ǽ	�xLh�),��F26�t�̾A�*/�e��-7�f�A��,d����{�����&t��_�_����;      �      x������ � �      �   H   x�= ��1	Сільпо-Фуд	\N
2	Новус Україна	\N
\.


X�!t      �   w  x�]�[�#�����8�@������|�v����*AH�T���9j��6>漟sۿ�t��<�ܾ�.��u^T��
u[<��ȈO4����Lw����;�Yd�Z�ki��C�����f�+cJ��^N<����Y ��f&��*�l��6��o�>�=�����j��f�rR�����Ŝ��B	t�ƅ՜œ��f�!�f$`������Kҝ�9��|֐za�v���d�cP�eHB���9$~6�鞲*S�c���o�(��^��G�ڝ���B�6�ȟ�K��t)�w�=����;�H�����sꞋ��ꬼ���	�jx���Ce��&�*�0wi��q#|ע���Up�L�t��eTW�Ǳ��fgio�C����V�m�(�	S u#��Ů�b���L�P�:֡��˦`"�ź�;Q��3b[��^������(9� SC���PVDg�����>����js�ɿ��ba�V`�B�����n90���.��Y�h��}XA�I5�JvU��th{2�Ȯ���>�uw[�e��󆭱�x�"�Sh�U���&E@�����zA{���N+�݉?u�A�h�N�8��`�DΜ���4�B
�J���򁮽��\6*ƛ_u�:�C��EXa1д�d9: ��G�%��Q7�G:��i���'�F���ӲM�� �-q���ʚͥ	��4�j��>�ρ�=�-C%��&�-A|k���tl_2�;EC����-�W~w
�0���0�����&��E��=�%�&�&F�b�k c�R�A�� %�UM�����n+������N�Ժ�U�&�C6h��ؠ��2A��SV$�G�w'/��T��Bd����� ~�OD�i��!d��/J
WjE� ^���6�Fg���fvH�z1�O={��Xw�6o;�9�5c� �b�^Ȟ��ϊ��JE��`%�D̼���O�V�}��}F�YтD��6vϋA�>Ț��9>�I�8����vh�T_J���e֚mE>�N�P.X�Pcp*���EE7��C�]l�QB�n�F�م&J�Ŀ�M��=-x��&���;�-��BK�=�聼�.4��k�3��|?Ƿ���n�cXZ��fmD=Z�N`5�9K|Z��A�fz�T���f�q�����Qp����S*��R� ��F�
K3� ��/9�Ĩ�3:��[�y
.�P�/��M��Fw,��h.y�>b��ᡬ�>X�?p�-�Z� �C#��_c��_�g��n�5�׮pJ�����)c%�n�4��gub�TЍ���p�z1��<��e��Ö�9
��A��%*��p>�l�j����_�^�!P��Ӈ�	�1�p�a7������")1{!ݤL�o=�r�4�5�2P^�f���0B���DbBzY�N���^����g��8/�Pn�a&��@F��F�2z��!��F�Ii�
$���4k�i�Mގ����#���0��K�l1t��:�du���_�lV}��T3-0����0���j�ayZ�̇~������������m	�ĥ���$�Is[�JX�{x&���ᶏ���5G�@���N�����Ee�a5�k�ė��؋�m�Y?~P<a�Uߍ��E-�Q�?�/���-*��v��y���aF�!Dy)��4?�E���h}�+e�J���`a����fZ�K{!��F˾�u0�C�B-�3��z,Z��nO�`���#�}��?�����.��"����*��|���v�� ,�����|9����O�t�W|��9�konE��z=r_3`K� ��_]�F}�����;�>wA����]��'?���s��y�5�G�^��Zߢ���]�(�U��n��k����������[      �      x�U�k�$�mD�,&?��܋���̶%�W�S��d�@  ��r~�W۳����-���'�W�w��ξ����'s��g��̲���g�뻎����6�9������I�*�}�<䴿U�[w������毾��>���ݟ�}��~�y���V�늓��g����VY��V�(�7�q:���T~��������ᑬ����o���[�o{Km���w^�:sϑ��<������|��/�~�X4v���Sk)�s���U�~6{os����qv-���Q�t}���z�]�5�~�W�^Z������zx���+���Ĺ������\��;8�����z{�s9cU,���.���U6�����||M�|�S{��^5?�z+�e����+�.�g��'v�Y~���Z{�K���[��k�Ƌj��������'Գ�~��{��n]N�y^���/�omm|��X������;F��{��_������L���A/}�?oͿ����z����n��\m�������Uˍ6�zqp�~���Ɯ{�ا����5�p}~���A���6Im6�>X�����X��-�枻?�O^�iڙ�y��_��z�G#��Z񋬿+uNa�k`�S��0x�a�������s�w
#���^����&�ϟx��y���&>4��_y ^�����u	sl����g�#������:�KԌ��W^�5��	��DW�-x���땈_�ט��6F"N�4�s�R��P��-u�>ǚ>�w�F�j�3��Pĳ&h H�{���ß�=��j�W��;��U{7���I?�6:g���bP��/��O��xp(�����m���]a�ӳe����/���Cgb1�~�u
��� �|���X.xe��Ϝ�PN��C�e��Ec��L����8g���hÃ�����@����j\��O��0�F���E_bR��{���
u @mD�/�rq;��c�'�b��Sz#C`-A��q/����|t���8��P�>��=���*b�g�=�#!��C@&	��:���"�L�`�H#qē�@�W��<�����k=�+��c+���s�����Ծ �=s����"�� 	8�c��4���������Ѹ�]N���g���#����h� ���4� ��6~N�o��*�¬
�����#I{dx��7�� O����:++���x�AD��Uox�`�"�=Y��$m�	���f\�|OO�_�2_��hƤN T�k�Lf��� D�]�I�%l��b~�5r��<A�/�/a�7�-�	����T�I��	���֯�����@�Ō�=������)�j� ��~�N��}G��L�p�i�ô�, 5�m|���G|xsΘ緀5�7��)��yY��g�e	`�����'���u%	�����r~D^!7*Y' ��>�-5!��dCN������i�)�|�	�c �y�0�I-����y�4�Z��8}BS�あk�$q���i�N��za���H޸�G����+j02,���%V%>�<��sjY��j�x��SS�	T=����	���x��0�aPs02r(��ب�~
������<�����y�������n]�yrS��a8'҇�/�Z���ĉ���d��=b�����$Ga؄&�&���`�t:����H�M^ub���`�+<����"��IP�,�|zB{��.`�
Հ��]6&ݘzi~9����D]?�C
�����K� .���()�z�+�eJ'P6�G#k�Ǽ����c�WlS9�)���9�!/�4a�o�� �%�C%!r x+V3�M'A��#D��ig��k= �9)�2
����^Y_��A=������q�s�(�㇭dC/�_��?�� ����zs�/'���!�c�����WI�,�.nV���O�#��c�k�m�p>JET�ri�]	A��	�N�T5���`3ߠ����T 	r���L�+
�o}0J����IWE�r���2��I�X�I��L�?��둾�Q�OI��N2����m%ly ���[4��;y���X'��1Ҭ���IC�;_!������ $����
d���~Oqm����a6�p���I�|-7�Dj��i����C��s�0D�V�ݪ��Ī�f)��J�a!��+�X�� R�\F��N~����l
�"C�r����L,�D�+|B����d�J�]�C�oYw�`������i�p�Y���x^��s½|����`�e�V�ő(ID��n��� �lVG�׭8�]@O�d�9��t?���d�i-��~8�3�l	�w6���,t�IM��^岖�g��ް�#��b%��XH�eG ��d����s�V�>	����6��a3@�O�ڐ��f�p�	�Ħ*�Ɉ_^�v��V�ǵ@�ɉ��� �0 ��5��$A��*"�(G�m�
�/F��OQ&c�}��}�	W�}�]M��%��
��M��^��/���9�4�P�2R��5 '4%�?�;���#iz_��&j���*���&� g�m� ��
aD�9�a���`q��T|~����	i�k̗�cBvUt4����VX�;%��i�{�~�g�)
-��
Y�qfTv�q>Q�M��k���C��?����Hڲ�.H�l�ӆ:���r9+�H�#Z_^6�	N7ͥF�0!gKr���-q^H��_�mD�LI<'Dϧ����q�O2b��3[��	#�λ`-*{2\Q�7��Kl�����.�|��KC	oZ��u�~�X���eM[0�Q��`M�+��e��)?��Q����J�f>d1�a�\�Eׁ�o��t����eIe�[�r�$iYL�oV]��x�i�`$z��Rn� ��94(c���;wM���n-�7�Lգ�n(c� �~8-vTk�f�bёѓ$�bx9*�C6�+qj0֣������u8I��U{�E!��x���k��٬�ł�d��1T�e��@Kąظ>���x;`-�(�S$�na %n�T�Bi)��D'.��؇�lh@��E9��U/Y�.`oy�,*#�>.��MA��X ~p�܌�1��Zx��j�ņ��rg(x�<�0��[�f��E|�9�)�Źb,�M0�L����R#E�i䨭Y�R�����|�����0���2Y=RԴ� {cƈi��0a(9����ხJ�7#�:B۔K���Al�0�Ƽ���%�m���e6	u��8W�"�]�m��2,������T#7!��X�: ����5�.Ļ�U����7���G�ԃ����#	��c�+�Hڗ���G�"��<����O�z(=�p'���*�cHmsGUA w�Hc�K������̻ⷕjق	�<��4%�1)`��@Y\�qr��#^aiV ���u�a[�k~��Jx!<�L�
�M�R'L��.q
��T��=��Yd�������ǌïqZ��!L��#���^�UÃ�o{E��jѠB䴷�?9���=���')j8K��yՆ��d�]�ƃ9x Or#����:��hz��6���$�q�"�j���
�NEy�(yE\�9KV�O�/�"�QH`����<�Q2^����X@��GQ�E�t-,����S�b3�v-��7�cU�����o���!&A*W�Y[�N�{�%�������ݬ*>���^F���Xp
\�>���GA�ϰ#ED_Q�>���rJA����dF"s�S;ʠ!��u���8֛s���~�.����"}r ���^�9�j>�>�*���s���e?R23�U�|��Y��+��<�4NU]�V	�'��J���*&���N�Ɣ��P�]J{�qxN�bPz�B0��1��!KT1$פֿOpH/0�U	u�M�i+I&&���=�����D���p�����j�T(�a�MSV�RN��1����	�%V�-�`�E`Ӊ�y��X%ʭɤ1�Q��K�I[�D�h�L ��)��B����זh���3���"���-e�p��qm�J    ~�lR����D���ax�RЙ/'RT@������a��6�^YF:
���W0����P�Qi$��vd�i٣��<[Zm��Lh��+�f�|�foa]�j�$m�b�3�� 2��啛��_��QjUّ�{_@���gu�st3�M�����-YUM�,N�n���Q�Qc�� @0�����x�'�R����y� ,% �q�_p��.?O���92A�!M�d�(��|���d��TY��o�վ~ ߪ&�ŅT��P�[�TGi�+̺I�(Mߊ�*f�������yr����f�	���v��������L���M�l�����tl+�9�P��A�ȳ��]�g8-�d�t�D[R9,��z��eb�O%�o�rD"����=��ey����!4��f=X��������7ᙘm�T:LA�.MH�t�7/%|�F���Ϲ����ħeo�IZWr�|���h�J�I�"��w/�7RSYV�������;�U�&��al���q�g�O6��TE��T��*Q�� 	D��ۿ {�*�R!K��R�Q� )S��ƪ��d( ��&E��-��q�r8��d�L�%��[�n�.��eS��{�����4Evc�X�-��'㱃`Yk����|J���.ɡԵ�┅¿�|�-u'�׊��ӬA�F'mP�?v?t��ùܠ:uȑ$�r�ހ�bY������H��k���<��NzR�#��ou�㽜j�֏5�;�mVDR�yÎ�E�ev`[�f؈~�ř�#�Î�4���O�{cghGѷF�4m�s�_���'5�}�H8���4$�2s���t$ST��?�}л��
����(Ա��AjE�%7 A=4Ou�T�@�Ĩ(���^C�T,����^����9M�+��q���;���3؍�؂^����Kp<�}q�P�@,R�*S���PH���E��8�u��y/nu5pN��I&d�t�T������p>'�ұ!/�H��:9aQ�ߴ� �6��K�R��R��%�~�U��q�f�B��R~<f�
��K���	���Y��1XP�Ѹ�9qSc�`-����Q�3u�� �b��>�L����)���1�F۽��ʞ��aIC�3�1 n��)ު��Һ�_�yxuS�}�&�$:^����ߩ�0�6DVW�O�$_p�rô`�f��O��x�ݾ���׫>�w,1�'������[�iyd>Ŷ�;��˪G�L��=�M}�6�ɫ���6'��&�V��Fh��[3��]��N��9��kõl��(_ˢ-~���!��؃,�뵻+�8
��k�� ^�ؿ���%���'<����+��[�ހ�������9Pc�N���3y!�nK^��t�O�?�����.�O�P\W��=�I�O ;��A{[�6)l��øە>�c��μ�7�a�%d�\�E��<�sprp
f�E#[���>p!�p��oL���60}�9�o��O�d�SP�&� X��*q�>��+��ύڲ�X"���y�*ܩ���y�4<�M��gO��$n��>
PM�뒃c��Tg��2VI��M�+t���QA�w��@M �An@F�JT^A������q�8�:���4�������l��{�ht�j:^�A�@q�z 8���`7z3���஠��@�JO[�ͱ���V�����SӞ&��l�)��-�M���/��<���pHg��7��+��m �;;���
;��� j͎��B��4v�)
����q`qk)Y�s��:¼�<)���f������Q*$L�!�,���fv�n��o��e�ϑ�(�i�6�#����N�(0>J��z���M�L#�����ɉ�>��r���B/C X��Bd�N�0����� ~L!_�D����o�� >�Fq�P��4+�h�a�]�N����U�^aNF��sD! �4�:����;[Y�8S�+K�[���� � ����ܔɶ��M\��m�+�U@1lQ4����]�|�raW���;-�!:�7��N�Ifd�i����ͱ9�I�����8$�2����0E)쬈zM����v��n�����[ɉU�~SMfO��^w^J	��'� �P7U�pdn�x{)¾�s淾3~��Q�Y��$dq�+������TsdTG�np�I��u[��=v�H�%��)�K��<i�w&Py��FP�7�m�R��N�O����v~c��2M��'d�v��^"�%�V)A���>g9�V&a�f�\C����T��%!���m���i���`-��+[ǋ����~��� X��n�?60yI�f#��G3n���i�.��w&U����`8���L4*'5xW7��vG��+�E�X��v*�����ޭ[�S��l�x�~/�1IbL\���3~��mf�_�#�Yd��z"��4�c�w���j��	�ﺂ޶<=�K�s���q�Zr]�L9ݡ�PK��t��&��;<�wR��$�xf������)�wgRk�	�S1i �hG��︵8
��箙��E$(>H�toN��_�A���Zn	K-iKA"�a�eoug�6ќ�Œ�	NHb���g��;�S� s"i�9�b�Ċ Z	�s�]�Z�!�����5ò�Bp�YH_$ˋ�h&	6��ԙq.9���w��K�P��-�:��g��7󓒜���)����x��m*��"�U��@������3����
�TE�v�Ċ֮�`Dt4��S�*�o��u�~�az��10�2%����28���98guS��t�Rs6Q��XP��b	���Կ�yT�-i;�� �� ��Lk�F�j�P�x{�T�s(�P>Vg<�ӻ:���CK,������ӻ#*�v���0��<�C�޺鶿��;}��6�,�732�Y-�$�[�bƛ�?��H��� s�<UY�mBR?`/59����@Gɼ���O�9�Ep%r���i����~��dz�WxuK%Ǿx��nm�L�d����ڳ)w�+��;#`v�~&���\�zg�7?r�\�6&V9��#ǧD�G��c�WO�dR�����3�7nE t9��z��4��tJ����{i��0u�M�;�2il��n�U�T�3]b	�Y�j�N��~^Y �I�˷[��T#��^�#?��7v�]��h��r{�c�J=��p��w��j��(�@���n�\���,����� ��Y��8�td"Pq��x�������fU� ��/v�oG����}'m�fOk�f�2_�%�LT�n�ao�G}�!���8Nw����N�!h�yQS���1�Y�JU21�:c���;�T�\U�]�ġ��� ��lp��p�I�x�T�b3�[n;FΚх	^p���|g(�cc!
�7��~�x���LZ���-�ģ��I%C���t6��
$��bȈ��'Z̝y�	B1Ȗ[��<�O��4o[��1\}Y1���2�šє��w=Q]�V�7��AH2�+N�+�CY�FSh�^�Z�!�7>�;]i��=�wUG0P�,�U��p�^�j-�ݙ-\����Ƕb��h�W�8�����/��m$y�G;��KU�侲���� +�*,< <�G�n��BS������J��~)0$sR���d�ɜF����.��Q\G���*����z�tzo�khL;N�o��qt����F���ޔ<����6?�y?��L�f~6~!`x�@�o�)/Fy������vd��p2_��h�.��4X�ͻO��;�k_�hY�ͼj����~���~/�:��‾9iP�z�o?z��v�����w��	I�%�X4ˌ�o�q�����u���}�%�nn�n6��2}��[��*�M�S͡�V�/� �5�[u"@�@<M��:��o����ض{=�x'��}�h��r�7=[fA W��7��'��Y������^(nW�=����s^F�<�SQ�����KЖ�.���w��}j��./�����x��(
L��iēߌ���s���0�(^�pP \  r������;��K�Kr�\���;K鰉Ͱ�N;���c�:N�(�yc������LS
p�n������{��H�.��5��"p0�Mo��S�TT/ޚ��iwG{+N/5GI�w	e�贶*��r�io� �p�4������e�jx��'P�[�
�n�^���&���`j�-��f�E"�^�qґ8&�I��B�<n�e(먡y�|�{!S�)Yd��^)~ӒQI)�0^�!��74j��3�,��9~��%��U�
Ν�q�W�S�o�|��ٯLCL�dA�����)�φ��_I����ROʿs����NJ9�v��,���� B&z�	{�Cx���x/��U�.�6/�R�{���g���q�E�����{��\q2��r:)���N����,�HV�0���5m�<%-���蹆"�8��@�;�-E�p�{,�&����S�r~Ǐ��N�w�Aɰ�7K$�h��Y�6xW 7=�C�k���bC�JWnO#��.S���^�b{�w�έ�_�WW�s�U���j������>��"pjλEj	�vS�D�ZH��g�r�˙Y���r'@٣�j�%�L�?=���Hڸ`�c�j	�T&s���l���qG��Lӊ��>����\9z�M�ځ��z��m"�����"�s�ǋ�5Ws}�J���V�ۖU0@o=���ȡx��nm=���R�@+	�(�l���0`Q�)sj(��ͬ��v����6��Nlt�@��7��J��Q̉��P����o��x�����Ö	N��6V�#�|�{����zyP�x�g�dt/�::ѽom��\�I�rQ���[x=>l� #!���rs���b��]nwkG%㑋�sl][7o�yE�)�u�Rګ:�L�Ch5�2�q[�߸�)kڞ��j,bD�Q�q�_���|Z�b��S@�]�|j�񺯾���b�m}�ƾ���Mc�
�{S����	����X;@^�Y�;~G�w��� �G���5(�D]�������7
5��H͓S��%���NՄ�z�ى���M�7w���*�l��7g�ޔŇ��&�	V:$�@:�v��#{��d��4o��;�4���,!���]L��̝	Q]sK):-ǂ�G�<��M㹒T�Qb�-��J�}\$&�ws0Խ�����O����������_ %~{�����`ɀ0|��[�\f�lyn�n�Κ�R-��j�T���,!]�$Q���i^�CD�8^/fG�]�N�,�8C�A%�;��U�`����dB�"�[Pɧ�N\�o��N���7!,YV�M&9�#��*e���=�6� ��͎����|מ;R�ڎ��f�ݖOqjߤ����G<�j�~w���eo29�ݬ��{V�����_���: z	HF�K�Q������knC�^�*���U6)�����8"��쿉��|��Y�A��c�,�-��P8Pa���"�W��:j���,oT�����y|E.�@�L����-��kl2L�Wy0��W1��c�!��|K;_qx_�
�"��M&�M�o��}� ��0�-��>�0I��$9�mZ�m�H�B'f"PP��&~�E����2����bR��hӁ�ƕ����z�r�7V!�؄5E�dh�Roos}���M�_7�Sx��8�%o��_T`��(+��}�9c�YZ��Z[���N�W��C����5�b�i #yō7��/ٱ/�8���Y��}��1���p�Vt~����-�� 6APe*�V��gz�0K��	�+_�u[�S�b[�)'E��JU�,~��I��e�(���"{�����ߵ���Ԅ���7ħ����3��΄G����������Ǫ�      �   Y   x���	�0C��StA]�a�^=W��
E[gH62�/�V\ʋ�#�`����IU�[+G���Fk$Fl�#���Uf�PU7n      �      x������ � �      �   �   x�m�A�0E��)z��Q.�	8Ht�K�!4�
n�/�q�����g�*4p���	=f�R����
7,���I���IT�RK�]D�;9IAy�h�\�-�7o�^.�3 gƔ?��B�O�V�N�K��6ql��9�b��q��:#�s��n��o����      �   �  x�}�۱�����b'0.H@q"���H@�%{���ej�w]�ܹ����O��D�_���ry�qp��������o�B��J=J� ?�LG��I�d�r�$�ld������@r?�zp@p��4�#)=����iR~ Y�&�IBdM�܏��v<�Z��1<ϧ�+�f���%�e�2�Qy韜��zJ��#�g�$�?J��^��Qؓ�D�#����,a����0:![]�ɜɓ���N�\N=���_UoR>��'"9����I���Q�~�/�4��a�$}!�?�nH~�fk��ApAޠ{�
��q�Hp?N2����q�#L܏7Y�ߏ��IV�:A�t������Nrx�]��c6�U�?J�z��f��i\x&�og/_����<n�'e��I4��'�����)���
�W��#��&yo�4�������U����$�BJ_���/(پ����ԟI
�׿���J2����\�uG��s�sE��d{ohfC;���)'۔��r�k�����M�1��������	P5\Se�E��~�z}��a��_@��nԍ���"���x������O��~��{A����� �04?����G�z�����GXtsY,^r-���(�a���,�|3�9�Ep�5�H�5묚��yf�69	C�"��ݬC�"K�'�\a�%�0Y�$f�t���0[�d��g4ɚ�'a��I�~�o�̺�Q8��y�����A��WMOA�O�BϠ��Vp�e/��G �/r<n�&}�T��M�`Y|Fj%��M�06�f�c��G��al2\�
�"CQb���,~Eܑ�(iV�����d�I����撛��y�K.���O���HM)|~Z޺MJ�'�u��a���-r��K��m�'�U��d8M��n��ȫ޺M���m�=����H����ޣ�`�|�W51z�u�\��]����3�Z���^i�H.a��l��;u�U[��)��8�'(����9��ah��6�S��4��g�8�nҿE��t��-2����	~a�$�����j��Ma��ݸ�b�$�Z�:�q ��*���*��,���)y��lw�V�!m��T;�V|�.Xp�d�y3���=����3v��=v��)��-��
v��,A��"9�8XpYd�Ҭ��Wp�1,�[u� HtV�]~�^W�y?��~��`��/6i7�(�4���Cm��{y%:B4K0�X��P�e[�&YSR�nb˛�+T���4�ܢ
+\-�Êp��J0�I�޽g\M2�q����d\-�{��q��H\����EHJ�*�(oj�	4�Er���F�J\5�<{Ւ|vV��	�b7Y\�E����/RÆ^�:<YY��qt�d7��4>����O�|���d	���k��GVOA㻦�K:#��Q�O���ݓA���g�I�K����Aa��#�\C��K�ǃ���z%���O uO��Om7c�U"�1>�-�X5r�'ecZK;���_����$K�Xć�8�7$�u��N��A��O�f����S�]PJi-"��X*c4��-��P/]dw*�zI�~i�*�(>�
��m3���m�!��/d�:�un��XRX�g9���սۇ&�jUɫ[$[��"��:�EN�ؽ��ꖊm������oc�c-�+�5�O2�.�`>ɰ����&%T���|�>����|���F�lA����"}�����Z���PZ+���P[�E{���O{��JP���NWm���@
�rGM�����&��4�Qc��w�*��Xe���M����b�ײ��p�]H!��n��Z"U�u�z�!��5��Z ��\|X��>�qzX����A�bBzX��^o�� �z�Q<� �(8(�����qzp�z�I/�����"Y��^�����[`\�,���%�l6Y�)��f��1.m6�����f�ǂ���`�m�w�w�6$��ey%�b�� ,�O2�LX�_d�,�Ȱ�e�E�@v�.cj�6%�0�P�AP�M3�h��\�jPp�l�^�_`��N���^��3�躱��{z�I�x�Y�夙3��&M�TgS�&-�}�f��v+ hJ#r��[��[�%}l6C�e�d�������ײʑ�|V?��� j�9R�lT|��zfa�&h���X�>9�|�T������h�O\[�ONCNw��|3h�L�t��}[��տ�	,2H�:4�E��T;*�ap�E�H^&`�����>ֿ�	,򝽚Ac	N�&��p̚��	lR�/�&���V��)f<~�[�i��,p�E�{��?ɑ�+�bl� �C$	0��s�'0��q�l�J2�@�b8|j�(�	,24W��	L2��U�=-�O`���?L�H_I������A1(O���5��p�,���"�3�T-�	��͡�i_�	,2�����#h�Z�h����ɢ1��"���/�Ԟ��ڷ�#6U���72<���&?~��l�.	6|����M��C?�ɷ�4��b?��Y�����6��C?�I9w��#����V�H!e��n��D�CG����s�;B��+��]:t��i��~p��̞�����t9���&Cu6���۷�Ac�,���tp����7�)��$�^`��*��{������d	{��I~6@ݠh]���([�B[�;��b�$߉��3�L�te�N������À�C�/�|�j�X1�6~�_��6��m�ER ������F͠�౜��ʿH��M���Ac�Y-��V���Z�[�2�ƖyRWvX=0(Xճ*����F�Ɵ�d���Ac��b�g���	,��W0��zZ�[��Uk��:�l����+{-Z�g�[�������(���"��4��\)��^���-�-�e����M n�:��	�AcC����m��t���Iɺg�KER"5�|��-%�
������&R4<I����r�,�\Q�D�BR����dH�}
���߀)Iֺ�"W/j�T.;O��%�X�P��i�dK����B�l�vO�fM$���};N�����:S��#'�����dJ��J�_�Z�r���	 ����f(��w"Z|tk>�<�f�mNԈh��v'j\��Y�/՚��jz�G�}�V�}�z�W�w{��G1f�PB�>Q������a2�~�q[O��OT/�[���}�i�,��	�>�9Cڣ��O3ž�~�)�Gl�
�ۊ�|�����>�"}M �}8��gY��ynd��s%���<�>f���������sZ�      �      x�3�LL������2�,-N-�b���� _h`      �      x�3�4��!c.N#(ۄ+F��� L��      �   N   x�5���@C�3�l���^���ܾ�����tb-5��&nj�(Ey�af� �����)�6Z�Q]J��w��}�      �   L   x�-˱� �X��0��74�
h��S���w�Y�S�,��R�v��
%�"��a����;<䜉� ��      �   �  x�m�Y�� E�3���	���_Gj�����:��������i��z�Xy4`操?�{� +�;��� �ր	��7��&�
l�ܗ���X�0�2��X�؁g��C����.���Q�����;�<㓶��H1Z�����̉��Xq,(mEZ�s�)Yv��!�?�f�Ҫ�*��W�����n�FQު���*���}�(�3��OO6"�v�3�b�L��_���z����?�V纖X�;�Z�.UiUV��u)cm^0�Q��+t_��
�� �|���z�6����S
Ea(��gh౲7`~�s� +�;����2�8xT5��*��{�������*�� +G&`.�C�Ҫ�*����#��ʣ0��'��
l��a�Σc1�U��y�,�
l�ܱ�@�!	C�$I� $AH���!	C�d��!$CH��!B2�d�R0�`���?�h� +�;��Cx�����-[<�l�в�C�}_NGr ����s
mԨ�� ���w�g�o$t�9��P?�m�K�P�|h6s��+��f��Ao�Z�$�O�� 7���9��+�r���x@�j��Mci�0��_3���j&�w�f�)~�����4{�s�"��~��������m�������'���֭Wif��j;Kg�R�����t�TL      �   W   x�-ʱ	�0���2����&(Z�X	��(1bf�o#�^���Z� ۄr�P���Y<c����6pZ"���X��������؄>K1�      �   5  x����n�@�뽧���of��v:P��Ti(�%R�xQ!�x�F������KnN����߬G��P���Kqu!P���l@I�X.��r�������S"O!C� �;GنCYA�7G����� �SL.2<e�)"=�R��R��,CQ鐣�}z��3e��
e��R�PNtߺ�ݯ�O�����k�C굑��,-�=�� "DҭFQ��������ح�fs�al��9�����RRֽ����r�}S٨C�1I�������V�޽�����򤔦�o�4��.�H!�n�v<LCQ᩟�~:�
�R���{���kSK9��6�$b4&�T��|�s���d�IU��z\T���?�>�����f�[�¬�Ue��/Q���C�QH����7�ܷ�*5U���V���}���d��5E']~�*�hP��J/���2jp/�t6inm�V����b���դU��f~c�v/GҒ�K�C�nAR��3{�߭3YurF���v����=Lh���Ý�|�i]�%����Č$Sf�6ؑy��s�W�j����      �   <  x�m��J�@���S��d��c�(��JE��K�Ҁ�<�P����ԋ*b��<��9�F�v��e��.t>�V�1��%n1ŽZ�g�r��\P���\��+��M���S60��^�����%�T|�N���*���L=Q��mS%×�f���Oo��N��);�����Q8g�Ź�v�ZH�4���v�W�$i�I�@U�${2��^'�~zODmb��~z�q_�'#
���͝�閸�Kf��pH���F$�rߥ�W�msu����}����<In���&��pp�̮_���ׄn������}��      �   �  x�u�ۑܸD�G�H�7
N\�;.�Mz��ՉC4��@��������?�����_J�ߕ����S�������\�^ȕ^�����;p�� W��Z7r�{t���]���%�C��/��M��r�\Y�|�Ϫ����E�~r���</��G�[V*��HN7�u��u?�?�oM#�_������A��[�^�O�t�@
�M<9Gwd��9��fK��Ka�J��KF9款��F�t�K�\���FҺ�������m>���mQ��-m7ra��W�� 6^|em����[E�+�����cԩ=�B<>��"�դۈ�]O�Kw���א������H����O������P򯠝�r���+p�z#Wz�Z�J��C�F��<�n�\��ѝ#�5�?������=���F�tDד���]�Z7r�#�^��h�u���_h��j	��������.8x#W�G׵>ȕ�����=������>1��sJ�{d< r;'�7�w�����������F��"�s*�x&�7��U�5�=���y�}#��M�\��k}�+}���Q��)��ȅ�*��j�� 3�{��P���m�R���\|�kL��(#]��壍�-f�T�2�]k"���i���P�6��ҶĢ������
��@�8|�q��b�kk��\E�\�XF�z#W:^m4�r�{�۵n�J���N�`-��^z`�nj��+ݣ3�7r�{tK�\�n&���>&�t�{sl*�A?0�dZo�J�t�����1#�u#W:&����]p�cW����Be�]��i��r�z#W:��M�\�]׺�+ݣR/��]����r��f��발~�������~����^N��\��3P��F�tD��_t�u��u�u�FBQ<�׍�90�M�\�]�� W�G7�n�J��Խם��=:�5s)�f.��z#W:����>ȕ��fֺ�+��"uT�B�������1+<��wǿ(���!�v#������}�0�m���uÔ�/�/�j[�ý9{leZ+�d{'�@T�WI7?���kD�o��a�p�ro� Z��ɰH�z �^ e�U����Q�
���������ھ7Lநba
���Un�և��e�~;�I��ku��U�f�y��p?w~T_/:�+�@'?�~��b��L�������4)R���:���'���D��hּ�O܁����Q����F�tT�ih}�+���֍\�B3�{Aq����<ﳋs��O���W���Dohx�%a\i�D.v��Td�r��;�U�\�x�ٴ>ȕ�+��u#W�Gw��q!��:�(	��M�r�{t��F�t�ni}�+�YҺ�+�Y�(�?��1Ҁ�%����B�t?�Zo�JGtִ>ȕ��u���>���z��5]�׊���8o��,��
v��'k��/��/6[_l�ݕ��,���V`�dW�{X�blG׾X	�+���\q��V�x���~���Y�x���~���E�x�\�~���E�x�\�~ &�V�~ &lp��Ƅ݊���݊���݊���݊�����F�t�N��D.�<����T�On��'7���zy��M���ܦ^^xnS-/<����ˋ�<5y��
��H���!Nk��.3y���𻋼L�`���"-��8�̀_]?f]2+?e]"+?c]2+?b]"+��$���*�M�Y�p��Ŋ&ɬp�
���\�'�kĹ*�{�ıjO���|�==�w�_�F�����a�=���ȕ�K���A�tT+�h�ȕ�B/W���"W�{���\��(/�s8N�ը>H�����[]��*�˼�-O�%������7����+�q�-�]��O�ؔ��>K�{[��0��Tk���.��C��}��^�F.l�~5i{��_��6rac�E�>^�����q���)�:��[mZo�J�ܺ���=��u#W�'7�>����D����c���z���أ[Zo�J�NI�\�~�)k�ȕ������D+B���L�&��L�&��L�v��L�v��L�v��L�v��L�v��L�v��L�v��L�v�|�YTP�*�{�A.l�+�{-#�W򽰇��}K<ym!��Y*��G8������,5r�#�,��N�zV��'=��n�����u7��_����gu��p�׳��f8��Y]w3���,��N�zV��,{t��A�t�N^w�l�J���u7+�\�ţ���V
�����N�7[i�J�+\��� W�_���V�\�~�K�7[M�BGɁ�9���3������ޗC�I�?�S�}^��ķ��N�*�~�}J�c���*��Dsi����gS�˺ox����㚯��U?�Z���Ix����]�ǉ��(���nu�<�B��G	�>W��^���V�&�;�Hx��jT+���V�0��}��j���K�џVy����x��Fuޭn�1��wXh�uޭ6���׻3�V���ݙ�V�.��ݙ����3��bL>�����>������1�>����>���.�����]���zL���9C��V�O�s>�����Vh5���nu��1Y����v»�A��"&��Q��w�[���jhuuޭN���'j�ՠ�4m�i�jfL>I[<-^A��w��*c�	��iqT;���V�O�Ʀ��:	?�:���V�u~Z����'�Ʀ�k˧���M��"�ƦC��w�[eL>�06��Nx�Z�2&��W�uޭn�1�$��ؔkP��j�ʘ0�����F�gɅ������/���0��q%�ʍt?��+q>f��`W�i�_B��x�-��a۰8�v'��WL⸷y���_^���K�e?x���]nQ�;ɓ!��/��=�����O�l�=
�A���Q[8,[��=�O�����C����6ٟP����U����"��a-�#���/�>��*vX��RE�����B��:z�d����M����󼯱�/3�f�O>��zp��6�BN�O��îY��ݡL{��'ķ������?+즌�׃�ⷊ���]�_	��؛<�sd�a+�����ػ;+�X�b-��������E+�P�]6�����/�u�B͊ǎߛ�D6�[#�D�w��籋4��k�71Ognv"gݟ�l�����O��X�.|l��i��LC:�Ob���n���?��P��}��pP��1�Iԩ�Y��C<}���&�O=}���!��"б�.�=�"��b�?��|�|5y�������������      �   -   x�3估�/l�2��va�� Ә�¬���=\1z\\\ ���      �     x�=���1��^� 3�H��D*�b�\rr��@��6��� wJ���0�4(*T������s����~�q���o�/��<}�Q����q!�S6TA4նZH@<�C
�Sǐ�d��M
5�.Ҡ�l�P[�[�l��h�2x�mqH�$j�^M�[���EǠ�W�[\����i����y����;xU�l1�J���:ͨgW�T+���!A]UuHQW����5T=�rT;�:P�9�VdG�s�!B=r�A�d����		$cB
ɘ�A2&� rHƄH�h��1!�<b��+Z�hƄ�1!�fL�A3&�Ќ	Ќ�b;4cB}��1^��2&$��	),cB˘P�eL�a:`����	�d�=�"X�(�"(h�kT��k44ɵ64͵:��Z��k��w���F�>o�qq��+n�����7)����k|��y�5�?�m�&����{��W��������5���m[\�s��sd��B;ڜ�5~ChsN׈b��7�Dx��?��+g      �   /   x�3估�®�/l���3Əˈ���.6^�za煽 �=... �P�      �      x�3估�®�/l���3Ə+F��� z�	*      �   /   x�3�4�0�4202�50�50T04�26�20�35571������ ���      �   �  x�}���!E�5�����$�O�{/�C2���ki�YԑZsh�X��ê������g��sk/���v���x�b0�8 � �^���A:��$R�Xl����21�$a΢KL��G��H�D��%�5H,��"J>k��$��b���^7��$+g��|������Q����~�p��bJK�Y��d��Ŗ�$x�I�
�~�5&'�x��rv��,�o+_��<$x[yJ,["P�&�,Lb��Xcr��G����Ŕ,�����"%���[�Ϫ�$��Il�kLN�����j�Dg1%�%�,Bb�H��bK�h��$6�~�� �F�q�g��ոkܮ�a�5.��qڸi���mk7Ϗ>��_t�ʩ9]�riN���馒��=W�����9>?5��o���_�>���x�      �   #   x�35�4���47�4�2f ������� VH�      �   s   x�e���`C�)� �0$i�� *$2JD��$+<o�E�J����8�)W��f�����2_w��'�_�6n�3Ҫ���f������b�#�o�:�O&���_�����Y�      �   �   x�]λ�@��x�
*`�{��Ր�9������ia�#.!��O#�7ti��6�����%��K��f/,^
8z�ꥂ��	�a�8t�S7�<�˞�G+H�U�v��NZ�һsE�nZ��W�����{�?|M��      �   Z   x�E���0��0�G(�v	'��sh����]h����T�	���6�9l�#��E수1E��7�i�s���g���Xl:��q��֐�      �   X   x�u���0��*h��^�P��:�I��f4�h4.RV/܊���|FA��FMç!��.�|�2���d��a������⎱��b      �   $   x������44�4200�4�24���@Db���� �g'      �   $   x�����4202�50�54R00�#NC�=... b��      �     x�-����0�8�-	�\.�8nF����zڲ�o9g-���u��l[��.;(F�#N)9� �~x��0�!,b�~70߯���8�~��C<���xE����,���)�l��R��r1�F8�'k�4����m�<�Z��`���e�\�)H�$r
�9ɂ��dAMA��� YPS�(���q����84��Z�j�z�ݬdk>�h6r��`�� |*`��yG_�5o�.N���8���um�{3w}��.>u0w������?�n�      �   *   x�3�4�20�2�44 �Ɯ�& ڄ��D�r��=... ���      �   #   x�3����K�2�N,KM�2��/.2b���� uj      �      x�3��q��ˈ�®��b���� N\�      �   Y   x�3�t���u�0�¾���.l��~aÅ�{.콰��.����\�va�	����+��M9/��^�wa7P��������� Ȼ`A     