<?php

class Nsr {

    static function get_ice_geojson($ice_id, $dt){
        global $pgsql;

        // ----------------------------------
        // Выборка льда для печати на карту
        // ----------------------------------
        return $pgsql->fetch_array($pgsql->query(sprintf("
            SELECT
            jsonb_build_object(
                'type', 'geojson',
                'data', jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(
                        jsonb_build_object(
                            'type', 'Feature',
                            'geometry', jsonb_build_object(
                                'type', 'Point',
                                'coordinates', jsonb_build_array(t.longitude, t.latitude)
                            ),
                            'properties', jsonb_build_object(
                                'color', t.color
                            )
                        )
                    )
                )
            ) AS result
            FROM (
                SELECT
                    tIce.lon AS longitude
                    ,tIce.lat AS latitude
                    ,tType.color
                FROM nsr.v_ice_values AS tIce
                INNER JOIN nsr.t_dict_ice_type AS tType
                    ON tType.id = tIce.ice_type_id
                WHERE 1 = 1
                    AND tIce.ice_id = %d 
                    AND tIce.dt = '%s'
                    AND tIce.value > 0
            ) AS t;
        ", $ice_id
        , $dt
        )))[0];
    }

    static function get_ice_graph($ice_id, $dt){
        global $pgsql;
        $out = array();

        // ---------------
        // Выборка граф
        // ---------------
        $res = $pgsql->query(sprintf("
            SELECT
                 start_p_id AS s
                ,end_p_id AS e
                ,ice_class_id AS ic
                ,weight AS w 
            FROM nsr.v_ice_graph
            WHERE 1 = 1 
                AND ice_id = %d 
                AND dt = '%s'
                --AND weight > 0
                --AND ice_class_id > 0
        ", $ice_id, $dt));

        $out['graph'] = array();
        while( $data = $pgsql->fetch_array($res) ) {
            $out['graph'][] = $data;
        }

        return $out;
    }

    static function get_ice_graph_plan($ice_id, $dt){
        global $pgsql;
        $out = array();

        // ---------------
        // Выборка граф
        // ---------------
        $res = $pgsql->query(sprintf("
            SELECT
                 start_p_id AS s
                ,end_p_id AS e    
                ,ROUND((distance::NUMERIC * 1.852)::NUMERIC, 2) AS d
                --,distance AS d
                --,ice_class_id AS ic
                ,ROUND(end_value::NUMERIC, 2) AS v
            FROM nsr.v_ice_graph
            WHERE 1 = 1 
                AND ice_id = %d 
                AND dt = '%s'
                --AND weight > 0
                --AND ice_class_id > 0
        ", $ice_id, $dt));

        $out['graph'] = array();
        while( $data = $pgsql->fetch_array($res) ) {
            //$edge_id = $data['s'].'_'.$data['e'];
            $out['graph'][] = $data;
        }

        return $out;
    }


    static function get_ice_graph_edge($ice_id, $dt){
        global $pgsql;
        $out = array();

        // ---------------
        // Выборка рёбер
        // ---------------
        $res = $pgsql->query(("
            SELECT
                 ice_id
                , dt
                , ice_class_id AS ic
                , edge_id
                , edge_json
            FROM nsr.t_ice_graph_edge_cache
            WHERE 1 = 1 
                AND ice_id = $ice_id 
                AND dt = '$dt'
                AND edge_id NOT LIKE '%undefined%'
            ;
        "));

        $out['edges'] = array();

        while( $data = $pgsql->fetch_array($res) ) {
            $out['edges'][] = $data;
        }
        return $out;
    }

    static function get_ice_types(){
        global $pgsql;
        $out = array('data' => array());

        $res = $pgsql->query(sprintf("
            SELECT *
            FROM nsr.t_ice_type
        "));

        while ($data = $pgsql->fetch_object($res)) {
            $out['data'][] = $data;
        }

        return $out;
    }

    static function get_statgraph($ice_id, $dt){
        global $pgsql;

        $out = array();
        $data = $pgsql->fetch_array($pgsql->query(sprintf("
            SELECT
                jsonb_build_object(
                'type', 'geojson',
                'data', jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(
                    jsonb_build_object(
                        'type', 'Feature',
                        'geometry', jsonb_build_object(
                            'type', 'Point',
                            'coordinates', jsonb_build_array(lon, lat)
                        ),
                        'properties', jsonb_build_object(
                            'point_name', point_name
                        )
                    )
                    )
                )
                ) AS result
            FROM (
                SELECT
                    lon,
                    lat,
                    point_name
                FROM nsr.v_ice_statgraph_points
                WHERE 1 = 1
                    AND ice_id = %d
            ) AS points;
        ",$ice_id)));

        $out['points'] = json_decode($data[0]);

        $data = $pgsql->fetch_array($pgsql->query(sprintf("
            SELECT
                jsonb_build_object(
                'type', 'geojson',
                'data', jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(
                        jsonb_build_object(
                            'type', 'Feature',
                            'geometry', jsonb_build_object(
                                'type', 'LineString',
                                'coordinates', jsonb_build_array(
                                    jsonb_build_array(start_lon, start_lat),
                                    jsonb_build_array(end_lon, end_lat)
                                )
                            ),
                            'properties', jsonb_build_object(
                                'title', 'title'
                            )
                        )
                    )
                )
            ) AS result
            FROM (
                SELECT
                    ice_id
                    , start_lon
                    , start_lat
                    , end_lon
                    , end_lat
                FROM nsr.v_ice_statgraph_edges
                WHERE 1 = 1
                    AND ice_id = %d
            ) AS t;

        ",$ice_id)));

        $out['lines'] = json_decode($data[0]);

        return $out;
    }

    static function cahce_ice_graph_edge($req){
        global $pgsql;
        $out = array('result' => true);

        $ice_id = @$req['ice_id'];
        $ice_class_id = @$req['ice_class_id'];
        $dt = @$req['dt'];
        $edge_id = @$req['edge_id'];
        $edge_json = @$req['edge_json'];

        $res = $pgsql->query(sprintf("
            INSERT INTO nsr.t_ice_graph_edge_cache
            (ice_id, dt, ice_class_id, edge_id, edge_json)
            VALUES(%d, '%s', %d, '%s', '%s')
            ON CONFLICT (ice_id, dt, ice_class_id, edge_id) DO NOTHING
            ;
        ",$ice_id, $dt, $ice_class_id, $edge_id, $edge_json));

        return $out;
    }


}