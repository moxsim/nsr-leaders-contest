SET search_path TO srv213918_pgsql;

DROP VIEW IF EXISTS nsr.v_tasks_transponse_icebreaker;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_schedule;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_icedata;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_coordinates;
DROP VIEW IF EXISTS nsr.v_tasks_transponse_icetype;
DROP VIEW IF EXISTS nsr.v_tasks_data_raw;

DROP VIEW IF EXISTS nsr.v_tasks_ships;
DROP VIEW IF EXISTS nsr.v_tasks_icebreakers;
DROP VIEW IF EXISTS nsr.v_ice_statgraph_edges;
DROP VIEW IF EXISTS nsr.v_ice_statgraph_points;
DROP VIEW IF EXISTS nsr.v_ice_values;
DROP VIEW IF EXISTS nsr.v_ice_graph;
DROP VIEW IF EXISTS nsr.v_ice_coords;

-- Структура таблицы `t_tasks`
DROP TABLE IF EXISTS nsr.t_tasks;
CREATE TABLE IF NOT EXISTS nsr.t_tasks (
    task_id SERIAL PRIMARY KEY,
    task_guid VARCHAR(36) NOT NULL UNIQUE,
    filename VARCHAR(256) NOT NULL,
    filesize INT NOT NULL,
    ice_id INT NULL,
    load_dtm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Структура таблицы `t_tasks_data_sheets`
DROP TABLE IF EXISTS nsr.t_tasks_data_sheets;
CREATE TABLE IF NOT EXISTS nsr.t_tasks_data_sheets (
    task_id INT NOT NULL,
    sheet_id SMALLINT NOT NULL,
    sheet_name VARCHAR(32) NOT NULL,
    dt DATE NULL,
    PRIMARY KEY (task_id, sheet_id)
    --,FOREIGN KEY (task_id) REFERENCES nsr.t_tasks (task_id) ON DELETE CASCADE
);


-- Структура таблицы `t_tasks_data_strings`
DROP TABLE IF EXISTS nsr.t_tasks_data_strings;
CREATE TABLE IF NOT EXISTS nsr.t_tasks_data_strings (
    task_id INT NOT NULL,
    string_id INT NOT NULL,
    string_name VARCHAR(1024) NOT NULL,
    PRIMARY KEY (task_id, string_id)
    --,FOREIGN KEY (task_id) REFERENCES nsr.t_tasks (task_id) ON DELETE CASCADE
);

-- Структура таблицы `t_tasks_data_raw`
DROP TABLE IF EXISTS nsr.t_tasks_data_raw;
CREATE TABLE IF NOT EXISTS nsr.t_tasks_data_raw (
    task_id INT NOT NULL,
    sheet SMALLINT NOT NULL,
    row INT NOT NULL,
    col VARCHAR(3) NOT NULL,
    val_string VARCHAR(64),
    val_int INT,
    val_float FLOAT,
    string_id INT,
    type VARCHAR(3),
    PRIMARY KEY (task_id, sheet, row, col)
);

-- Структура таблицы `t_tasks_data_row`
DROP TABLE IF EXISTS nsr.t_tasks_data_row;
CREATE TABLE IF NOT EXISTS nsr.t_tasks_data_row (
    task_id INT NOT NULL,
    sheet SMALLINT NOT NULL,    
    row INT NOT NULL,
    PRIMARY KEY (task_id, sheet, row)
);

-- Структура таблицы `t_ice`
DROP TABLE IF EXISTS nsr.t_ice;
CREATE TABLE IF NOT EXISTS nsr.t_ice (
    ice_id SERIAL PRIMARY KEY,
    ice_guid VARCHAR(36) NOT NULL UNIQUE,    
    load_dtm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_dt DATE NULL
);

-- Структура таблицы `t_ice_coords`
DROP TABLE IF EXISTS nsr.t_ice_coords;
CREATE TABLE IF NOT EXISTS nsr.t_ice_coords (
    coord_id SERIAL PRIMARY KEY,
    ice_id INT NOT NULL,
    x INT NOT NULL,
    y INT NOT NULL,
    lon FLOAT NOT NULL,
    lat FLOAT NOT NULL,
    is_earth BIT DEFAULT B'0' NOT NULL
);
ALTER TABLE nsr.t_ice_coords ADD CONSTRAINT uk_t_ice_coords UNIQUE (ice_id, x, y);

-- Структура таблицы `t_ice_dates`
DROP TABLE IF EXISTS nsr.t_ice_dates;
CREATE TABLE IF NOT EXISTS nsr.t_ice_dates (
    ice_id INT NOT NULL,
    dt DATE NOT NULL
);
ALTER TABLE nsr.t_ice_dates ADD CONSTRAINT pk_t_ice_dates PRIMARY KEY (ice_id, dt);

-- Структура таблицы `t_ice_values`
DROP TABLE IF EXISTS nsr.t_ice_values;
CREATE TABLE IF NOT EXISTS nsr.t_ice_values (
    coord_id INT NOT NULL,
    dt DATE NOT NULL,
    value FLOAT NULL,
    ice_type_id SMALLINT NULL,
    ice_class_id SMALLINT NULL
);

ALTER TABLE nsr.t_ice_values ADD CONSTRAINT pk_t_ice_values PRIMARY KEY (coord_id, dt);

DROP TABLE IF EXISTS nsr.t_ice_graph;
CREATE TABLE nsr.t_ice_graph(
    ice_id INT NOT NULL,
    dt DATE NOT NULL,
    --------------
    start_coord_id INT NOT NULL,
    start_x INT NOT NULL,
    start_y INT NOT NULL,
    start_ice_class_id SMALLINT NOT NULL,
    end_coord_id INT NULL,
    end_x INT NOT NULL,
    end_y INT NOT NULL,
    --------------
    start_value FLOAT NULL,
    end_ice_class_id SMALLINT NULL,
    end_value FLOAT NULL,
    avg_value INT NULL,
    distance INT NULL
);

DROP TABLE IF EXISTS nsr.t_ice_graph_extremum;
CREATE TABLE nsr.t_ice_graph_extremum(
    ice_id INT NOT NULL,
    dt DATE NOT NULL,
    --------------
    value_max FLOAT NOT NULL,
    value_min FLOAT NOT NULL,
    distance_max INT NOT NULL,
    distance_min INT NOT NULL
);

-- Структура таблицы `t_ice_statgraph_points`
DROP TABLE IF EXISTS nsr.t_ice_statgraph_points;
CREATE TABLE nsr.t_ice_statgraph_points(
    coord_id INT NOT NULL,
    point_id INT NOT NULL
);
ALTER TABLE nsr.t_ice_statgraph_points ADD CONSTRAINT pk_t_ice_statgraph_points PRIMARY KEY (coord_id, point_id);

-----------------------------------------------------------

DROP TABLE IF EXISTS nsr.t_tasks_ships;
CREATE TABLE nsr.t_tasks_ships (
    ship_id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    ship_name VARCHAR(256) NOT NULL,
    arc_class_id SMALLINT NULL,
    arc_class_input VARCHAR(32) NULL,
    speed_knot numeric NULL,
    speed_kmph numeric NULL,
    start_p_id VARCHAR(32) NULL,
    start_coord_id INT NULL,
    end_p_id VARCHAR(32) NULL,
    end_coord_id INT NULL,
    start_date DATE NULL
);
ALTER TABLE nsr.t_tasks_ships ADD CONSTRAINT uk_t_tasks_ships UNIQUE (task_id, ship_name);

DROP TABLE IF EXISTS nsr.t_tasks_icebreakers;
CREATE TABLE nsr.t_tasks_icebreakers (
    icebreaker_id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    ship_name VARCHAR(256) NOT NULL,
    arc_class_id SMALLINT NULL,
    arc_class_input VARCHAR(8) NULL,
    speed_knot numeric NULL,
    speed_kmph numeric NULL,
    start_p_id VARCHAR(32) NULL,
    start_coord_id INT NULL,
    start_date DATE NULL
);
ALTER TABLE nsr.t_tasks_icebreakers ADD CONSTRAINT uk_t_tasks_icebreakers UNIQUE (task_id, ship_name);



-- Структура таблицы `t_ice_graph_edge_cache`
DROP TABLE IF EXISTS nsr.t_ice_graph_edge_cache;
CREATE TABLE IF NOT EXISTS nsr.t_ice_graph_edge_cache (
    ice_id INT NOT NULL,
    dt DATE NOT NULL,
    ice_class_id SMALLINT NOT NULL,
    edge_id VARCHAR(32) NOT NULL,
    edge_json JSON NULL
);
ALTER TABLE nsr.t_ice_graph_edge_cache ADD CONSTRAINT pk_t_ice_graph_edge_cache PRIMARY KEY (ice_id, dt, ice_class_id, edge_id);

INSERT INTO nsr.t_ice_graph_edge_cache
(ice_id, dt, ice_class_id, edge_id, edge_json)
SELECT ice_id, dt, ice_class_id, edge_id, edge_json
FROM nsr.t_ice_graph_edge_cache__temp
;


/*
-- Сохранение кешей
DROP TABLE IF EXISTS nsr.t_ice_graph_edge_cache__temp;
SELECT ice_id, dt, ice_class_id, edge_id, edge_json
INTO nsr.t_ice_graph_edge_cache__temp
FROM nsr.t_ice_graph_edge_cache
*/

