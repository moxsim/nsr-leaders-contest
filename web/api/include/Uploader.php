<?php

class Uploader {
 
    static function upload_file(&$task_id = 0){
        global $GUID, $pgsql;

        $fileExists = false;
        $filesize = (int) @$_FILES["attachment"]["size"];

        if ($filesize == 0){
            return "Вы пытаетесь загрузить пустой файл";
        }

        if ($filesize > 5242880){
            return "Размер файла не должен превышать 5 МБ";
        }

        // ---------------------
        // Проверяем тип файла
        // ---------------------
        $postFileExtEnabled = strtolower('xlsx');
        $exts = explode(",",$postFileExtEnabled);

        $filename = $_FILES["attachment"]["name"];
        $arr = explode(".", $filename);
        $ext = end($arr);

        if(!in_array( strtolower($ext) , $exts)) {
            return "Доступна загрузка только файлов с раширением XLSX";
        }

        // -----------------------------
        // Проверяем загружен ли файл
        // -----------------------------
        if(is_uploaded_file($_FILES["attachment"]["tmp_name"]))
        {
            $fileExists = true;
        } else {
            return "Ошибка загрузки файла";
        }

        // -----------------------------
        // Создаём новый Task в БД
        // -----------------------------
        $newTask = array(
            'GUID' => $GUID,
            'filename' => $filename,
            'filesize' => $filesize
        );

        $Task = new Task(null, $newTask);
        $task_id = $Task->getId();

        if (!@$task_id){
            return "Ошибка регистрации файла в БД";
        }

        return null;
    }

    static function parse_xlsx_file($task_id, &$xlsx_data = array()){
        global $pgsql, $GUID;

        $file = $_FILES["attachment"]["tmp_name"];
        $root = FILE_ROOT . "/../uploads/";
        $folder = $GUID;
        chkFolders($root, $folder);

        $destination_dir = $root . $folder;

        $archive = new PclZip( $file );
        if ($archive->extract(PCLZIP_OPT_PATH, $destination_dir) == 0) {
            return "Проблема распаковки xlsx. Ошибка : ". $archive->errorInfo(true);
        }

        /*
        $shared_file = $destination_dir . '/_sharedStrings.xml';
        file_put_contents($shared_file, XlsxParse::get_shared_strings_xml($destination_dir));
        $sheet_top_file = $destination_dir . '/_sheetTop.xml';
        file_put_contents($sheet_top_file, XlsxParse::get_sheet_top_xml($destination_dir,10));
        */

        // -------------------------------------
        // Записываем в БД справочник листов
        // -------------------------------------
        $xlsx_data['workbook'] = xml2array(XlsxParse::get_workbook_xml($destination_dir));
        $xlsx_data['sheets'] = array();
        foreach($xlsx_data['workbook']['workbook']['sheets']['sheet'] as $key => $sheet){
            if ( @$sheet['sheetId']) {
                $xlsx_data['sheets'][] = $sheet;
            }
        }

        $query = 'INSERT INTO nsr.t_tasks_data_sheets (task_id, sheet_id, sheet_name, dt) VALUES ';
        foreach($xlsx_data['sheets'] as $key => $val){
            if ($key > 0) $query .= ",";
            $query .= sprintf("(%d, %d, '%s', try_parse_date('%s', 'DD-Mon-YYYY'))
                ",$task_id
                ,$val['sheetId']
                ,$val['name']
                ,$val['name']
            );
        }
        $pgsql->query($query);

        // -------------------------------------
        // Формирование Config
        // -------------------------------------
        $debug = false;
        $xlsx_data['config'] = array(
            'sheet' => array (
                '1' => array(
                    'name' => 'schedule',
                    'headerRow' => 1,
                    'partSize' => 1000,
                    'columnNames' => array(
                         'A' => 'Название судна'
                        ,'B' => 'Ледовый класс'
                        ,'C' => 'Скорость, узлы (по чистой воде)'
                        ,'D' => 'Пункт начала плавания'
                        ,'E' => 'Пункт окончания плавания'
                        ,'F' => 'Дата начала плавания'
                    )
                )
                ,'2' => array(
                    'name' => 'icebreaker',
                    'headerRow' => 1,
                    'partSize' => 1000,
                    'columnNames' => array(
                         'A' => 'Название судна'
                        ,'B' => 'Ледовый класс'
                        ,'C' => 'Скорость, узлы (по чистой воде)'
                        ,'D' => 'Пункт начала плавания'
                        ,'E' => 'Дата начала плавания'
                    )
                )
            )
        );

        $ice_id = 1;
        $is_new_ice = false;

        if (!$debug) {
            foreach($xlsx_data['sheets'] as $key => $val){
                if ($val['sheetId'] == 3) {
                    $xlsx_data['config']['sheet'][$val['sheetId']] = array(
                        'name' => 'lon',
                        'headerRow' => 0,
                        'partSize' => 50
                    );
                }

                if ($val['sheetId'] == 4) {
                    $xlsx_data['config']['sheet'][$val['sheetId']] = array(
                        'name' => 'lat',
                        'headerRow' => 0,
                        'partSize' => 50
                    );
                }

                if ($val['sheetId'] > 4){
                    $is_new_ice = true;
                    $xlsx_data['config']['sheet'][$val['sheetId']] = array(
                        'headerRow' => 0,
                        'partSize' => 50
                    );
                }
            }
        }

        if ($is_new_ice) {
            // ---------------------------------------------------------
            // Создаём новый Ice, если он присутствует в файле заливки
            // ---------------------------------------------------------
            $newIce = array(
                'GUID' => $GUID
            );

            $Ice = new Ice(null, $newIce);
            $ice_id = $Ice->getId();

            if (!@$ice_id){
                return "Создания нового Льда";
            }
        }

        $xlsx_data['ice_id'] = $ice_id;
        $xlsx_data['is_new_ice'] = $is_new_ice;

        // Обновляем в БД принадлежность Задания ко Льду
        $pgsql->query(sprintf("
            UPDATE nsr.t_tasks SET
                ice_id = %d
            WHERE 1 = 1
                AND task_id = %d
        ", $ice_id, $task_id));

        // -------------------------------------
        // Записываем в БД справочник строк
        // -------------------------------------
        $xlsx_data['shared_strings'] = xml2array(XlsxParse::get_shared_strings_xml($destination_dir));
        //$xlsx_data['sheet_top'] = xml2array(XlsxParse::get_sheet_top_xml($destination_dir,1));

        $strings = [];
        $query = 'INSERT INTO nsr.t_tasks_data_strings (task_id, string_id, string_name) VALUES ';
        foreach($xlsx_data['shared_strings']['sst']['si'] as $key => $val) {
            $strings[$key] = (@$val['t']) ? $val['t'] : $val['r']['t']; // TODO: сделать предварительное преобразование XSL

            if ($key > 0) $query .= ",";

            $query .= sprintf("(%d, %d, '%s')
                ",$task_id
                ,$key
                ,escape_string(@$val['t'])
            );
        }

        $pgsql->query($query);

        $xlsx_data['sheet_top'] = array();

        foreach ($xlsx_data['config']['sheet'] as $sheetNumber => $sheetCfg){
            // --------------------
            // Разбираем шапку
            // --------------------
            if (@$sheetCfg['headerRow']) {
                $xml = new DOMDocument;
                $xml->loadXML(XlsxParse::get_sheet_top_xml($destination_dir, 1, $sheetNumber));
    
                $xsl = new DOMDocument;
                $xsl->load(FILE_ROOT.'/xsl/sheet_parse_top.xsl');
    
                $proc = new XSLTProcessor;
                $proc->importStyleSheet($xsl); // применяем xsl правила
    
                $xlsx_data['sheet_top'][$sheetNumber] = xml2array($proc->transformToXML($xml));
    
                $columnNames = (@$sheetCfg['columnNames']) ? $sheetCfg['columnNames'] : array();
                $headerRow = (@$sheetCfg['headerRow']) ? $sheetCfg['headerRow'] : '0';
    
                $errorMsg = '';
                foreach($xlsx_data['sheet_top'][$sheetNumber]['sheet']['cell'] as $key => $val){
                    if ($val['row'] != $headerRow) break;
    
                    $col = $val['col'];
                    $needed = $columnNames[$col];
                    $asis = ($val['type'] == 's') ? $strings[$val['val']] : $val['val'];
                    
                    if ($needed != $asis){
                        $errorMsg .= "На листе [$sheetNumber] в шапке в столбце <b>[$col]</b> должно быть <b>[$needed]</b>, а у вас <b>[$asis]</b><br>";
                    }
                }
                if (@$errorMsg) return $errorMsg;
            }
        
            // ---------------------------------
            // Разбираем данные листа по файлам
            // ---------------------------------
            $xlsx_data['sheet_part_files'][$sheetNumber] = array();
            $rowLimit = (@$sheetCfg['partSize']) ? $sheetCfg['partSize'] : 50;
            XlsxParse::get_sheet_parts_xml ($destination_dir, $rowLimit, $sheetNumber, $xlsx_data['sheet_part_files'][$sheetNumber]);

        }

        return null;
    }

    static function save_xlsx_data($task_id, &$xlsx_data = array()){
        global $pgsql;

        foreach($xlsx_data['sheet_part_files'] as $sheetNumber => $sheetData) {

            // -----------------------------------------------------------
            // Пробегаем по всем пакетам и сохраняем сырые данные в БД
            // -----------------------------------------------------------
            foreach($xlsx_data['sheet_part_files'][$sheetNumber] as $filename){
                $xml = new DOMDocument;
                $xml->load($filename);

                $xsl = new DOMDocument;
                $xsl->load(FILE_ROOT.'/xsl/sheet_parse_data.xsl');
        
                $proc = new XSLTProcessor;
                $proc->importStyleSheet($xsl); // применяем xsl правила

                $xlsx_array = xml2array($proc->transformToXML($xml));
                //file_put_contents($filename.'.xsl', json_encode($xlsx_array)); // Для отладки
                //$xlsx_data['sheet_data'][] = $xlsx_array; // Для отладки

                $query = 'INSERT INTO nsr.t_tasks_data_raw (task_id, sheet, row, col, val_string, val_int, val_float, string_id, type) VALUES ';
                foreach($xlsx_array['sheet']['cell'] as $key => $val) {
        
                    if ($key > 0) $query .= ",";
                    $type = @$val['type'];
                    if (is_array($type)) $type = '';
                    $value = @$val['val'];

                    $query .= sprintf("(%d, %d, %d, '%s', '%s', %s, %s, %s, '%s')
                        ",$task_id // task_id
                        ,$sheetNumber // sheet
                        ,$val['row'] // row
                        ,str_replace($val['row'], '', $val['col']) // col -> вырезаем  номер строки
                        ,($type != 's') ? $value : 'NULL' // val_string
                        ,($type != 's') ? (int) $value : 'NULL' // val_int
                        ,($type != 's') ? (float) $value : 'NULL' // val_float
                        ,($type == 's') ? $value : 'NULL' // string_id
                        ,$type // type
                    );
                }

                $pgsql->query($query, true);

            }
        }
        Uploader::after_save($task_id, $xlsx_data);

        return null;
    }

    static function after_save($task_id, &$xlsx_data = array()){
        global $pgsql;

        $ice_id = $xlsx_data['ice_id'];

        // -----------------------------------------------------------
        // Схлопываем сырые данные до уровня `task_id`, `sheet`, `row`
        // -----------------------------------------------------------
        $query = '';
        foreach ($xlsx_data['config']['sheet'] as $sheetNumber => $sheetCfg){
            $query .= sprintf("
                INSERT INTO nsr.t_tasks_data_row
                (
                    task_id,
                    sheet,
                    row
                ) 
                SELECT 
                    task_id
                    ,sheet
                    ,row
                FROM nsr.t_tasks_data_raw
                WHERE 1 = 1
                    AND task_id = %d
                    AND sheet = %d
                    AND row > %d
                GROUP BY  
                    task_id
                    ,sheet
                    ,row
                ;

            ",$task_id
            ,$sheetNumber
            ,@$sheetCfg['headerRow']
            );
        }
        $pgsql->query($query);

        if ($xlsx_data['is_new_ice'] ){
            $pgsql->query(sprintf("
                -------------------------------------------
                -- Заливаем данные льда
                SELECT nsr.fnc_ice_prepare_data(%d, %d);
                ", $task_id, $ice_id
            ));

            $pgsql->query(sprintf("
                -------------------------------------------
                -- Заливаем граф льда
                SELECT nsr.fnc_ice_prepare_graph(%d);

                ", $ice_id
            )); 
        }

        $pgsql->query(sprintf("
            -------------------------------------------
            -- Заливаем корабли и ледоколы
            SELECT nsr.fnc_task_prepare_data(%d);

            ", $task_id
        )); 



        return null;
    }

}
