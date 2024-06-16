<?php

class XlsxParse {

    static function get_workbook_xml ($resultFolder){
        // ----------------------------------------------------------------
        // Вытаскивем инфу по строковым переменным из xl/workbook.xml
        // ----------------------------------------------------------------
        $workbook_xml_file = $resultFolder . DIRECTORY_SEPARATOR . 'xl' . DIRECTORY_SEPARATOR . 'workbook.xml';
        $workbook_xml_data = '';
        if (file_exists($workbook_xml_file)) {
            $workbook_xml_data = file_get_contents($workbook_xml_file);
            $workbook_xml_data = preg_replace('/(\<\?xml)(.*)(\?>)/', '', $workbook_xml_data);
            $workbook_xml_data = str_replace(' xmlns="',' _xmlns="',$workbook_xml_data);
            $workbook_xml_data = str_replace(' xmlns:r="',' _xmlns_r="',$workbook_xml_data);
            //$workbook_xml_data = preg_replace("/\s+/u", " ", $workbook_xml_data); // nbsp меняем на простой space
        }
        return $workbook_xml_data;
    }

    static function get_shared_strings_xml ($resultFolder){
        // ----------------------------------------------------------------
        // Вытаскивем инфу по строковым переменным из xl/sharedStrings.xml
        // ----------------------------------------------------------------
        $sharedStrings_xml_file = $resultFolder . DIRECTORY_SEPARATOR . 'xl' . DIRECTORY_SEPARATOR . 'sharedStrings.xml';
        $sharedStrings_xml_data = '';
        if (file_exists($sharedStrings_xml_file)) {
            $sharedStrings_xml_data = file_get_contents($sharedStrings_xml_file);
            $sharedStrings_xml_data = preg_replace('/(\<\?xml)(.*)(\?>)/', '', $sharedStrings_xml_data);
            $sharedStrings_xml_data = str_replace(' xmlns="',' _xmlns="',$sharedStrings_xml_data);
            $sharedStrings_xml_data = str_replace(' xmlns:r="',' _xmlns_r="',$sharedStrings_xml_data);
            //$sharedStrings_xml_data = preg_replace("/\s+/u", " ", $sharedStrings_xml_data); // nbsp меняем на простой space
        }
        return $sharedStrings_xml_data;
    }

    static function get_sheet_top_xml ($resultFolder, $param_top = 5 /* Сколько строк шапки отрезать */, $sheetNumber = '1'){
        // Пробегаем по всем xl/worksheets/sheet[n].xml
        $sheet_xml_data = '<response>'; // data+
        
        $sheet_dir = $resultFolder . DIRECTORY_SEPARATOR . 'xl' . DIRECTORY_SEPARATOR . 'worksheets';
        if ($handle = opendir($sheet_dir)) {
            while (false !== ($file = readdir($handle))) {
                // Пробегаем по листам
                if (preg_match('/^sheet[0-9]{1,2}.xml$/i',$file)) {
                    $sheetId = preg_replace('/^sheet([0-9]{1,2}).xml$/i','$1',$file);
                    if ($sheetId != $sheetNumber) continue;

                    $sheet_xml_file = $sheet_dir . DIRECTORY_SEPARATOR . $file;
                    // 1. вырезаем первые строки, для этого читаем файл свеху и находим первую строку
                    $rowData = '';
                    
                    $sheet_xml_data .= '<sheet id="'.$sheetId.'">'; // data+
                    
                    // Находим все схемы, которые необходимо будет выпилить из sheet.xml
                    $xmlnsArray = array();
                    $fpRead = fopen($sheet_xml_file, "r");
                    if ($fpRead)
                    {
                        $xmlHeader = fgets($fpRead, 4096); // Он нам не нужен
                        $data = fgets($fpRead, 4096); // Он нам не нужен
                        $arr = array();
                        preg_match_all('/xmlns:(\S*)=/i', $data, $arr);
                        if (@$arr[1]) $xmlnsArray = $arr[1];
                        fclose($fpRead); // Закрытие файла
                    }
                    
                    $fpRead = fopen($sheet_xml_file, "r");
                    if ($fpRead)
                    {
                        $xmlHeader = fgets($fpRead, 4096); // Он нам не нужен
                        $data = '';
                        $index = 1;
                        while (!feof($fpRead))
                        {
                            $data .= fgets($fpRead, 1024);
                            if (!strstr($data, '<row ')) continue;
                            
                            $data = strstr($data, '<row '); // Отрезаем чтобы начало было <row
                            $indexStartRow = strpos($data,'<row '); // IF Находим первый [<row ]
                            
                            while ($indexStartRow === 0) {
                                $indexFinishRow = strpos($data,'</row>');
                                if ($indexFinishRow > 0) { // Нашли [</row>]
                                    $rowData .= substr($data,0,$indexFinishRow+6);
                                    $index++;
                                    $data = strstr($data, '</row>');
                                    $data = strstr($data, '<row '); // Отрезаем чтобы начало было <row
                                    $indexStartRow = strpos($data,'<row '); // IF Находим первый [<row ]
                                } else {
                                    break; // Не нашли [</row>]
                                }
                            }
                            if ($index > $param_top) break;
                        }
                        fclose($fpRead); // Закрытие файла
                    }
                    
                    foreach($xmlnsArray as $val) {
                        $rowData = str_replace(' '.$val.':', ' ', $rowData);
                    }
                    
                    $sheet_xml_data .= $rowData; // data+
                    
                    // 2. считаем количество строк, для этого читаем разрешение файла <dimension ref="A2:H15"/>
                    $fpRead = fopen($sheet_xml_file, "r");
                    $dimensionNode = '';
                    $data = '';
                    if ($fpRead)
                    {
                        
                        $xmlHeader = fgets($fpRead, 4096); // Он нам не нужен
                        $data = fgets($fpRead, 4096);
                        $data = strstr($data, '<dimension ref="'); // Отрезаем чтобы начало было [<dimension ref="]
                        $endNode = strpos($data,'/>');
                        $dimensionNode = substr($data,0,$endNode+2);
                        $dimensionNode = preg_replace('/^<dimension ref="([A-Z]{1,3})([0-9]{1,12}):([A-Z]{1,3})([0-9]{1,12})"\/>$/i'
                                        ,'<dimension c1="$1" r1="$2" c2="$3" r2="$4"/>',$dimensionNode);
                        
                        fclose($fpRead); // Закрытие файла
                    }                
                    $sheet_xml_data .= $dimensionNode; // data+
                    
                    // 3. Находим объединенные ячейки
                    //<mergeCells count="2">
                    //    <mergeCell ref="G1:H1"/>
                    //    <mergeCell ref="C1:C2"/>
                    //</mergeCells>
                    $fpRead = fopen($sheet_xml_file, "r");
                    $data = '';
                    if ($fpRead)
                    {
                        fseek($fpRead, -2000000, SEEK_END); // Отрезаем 2000000 байт с конца
                        while (!feof($fpRead))
                        {
                            $data .= fgets($fpRead, 4096);
                        }
                        $data = strstr($data, '<mergeCells '); // Отрезаем чтобы начало было <mergeCells
                        $indexStartRow = strpos($data,'<mergeCells '); // IF Находим первый [<mergeCells ]
                        if ($indexStartRow === 0) {
                            $indexFinishRow = strpos($data,'</mergeCells>');
                            $sheet_xml_data .= substr($data,0,$indexFinishRow+13); // data+
                        }
                        
                        fclose($fpRead); // Закрытие файла
                    }
                    $sheet_xml_data .= '</sheet>'; // data+
                } 
            }
            closedir($handle); 
        }
        $sheet_xml_data .= '</response>';
        //$sheet_xml_data = preg_replace("/\s+/u", " ", $sheet_xml_data); // nbsp меняем на простой space
        //error_log($sheet_xml_data);
        return $sheet_xml_data;
    }

    static function get_sheet_parts_xml ($resultFolder, $partLimit = 10000, $sheetNumber = '1', &$output = array()){
        $sheetFile = $resultFolder . '/xl/worksheets/sheet' . $sheetNumber;
        $fileSheet = $sheetFile. ".xml";

        // Находим все схемы, которые необходимо будет выпилить из sheet.xml
        $xmlnsArray = array();
        $fpRead = fopen($fileSheet, "r");
        if ($fpRead)
        {
            $xmlHeader = fgets($fpRead, 4096); // Он нам не нужен
            $data = fgets($fpRead, 4096); // Он нам не нужен
            $arr = array();
            preg_match_all('/xmlns:(\S*)=/i', $data, $arr);
            if (@$arr[1]) $xmlnsArray = $arr[1];
            fclose($fpRead); // Закрытие файла
        }

        $fpRead = fopen($fileSheet, "r");
        if ($fpRead)
        {
            $xmlHeader = fgets($fpRead, 4096); // Header <?xml... Он нам не нужен
            $dataTmp = '';
            $index = 1;
            $part = 1;
            
            $filewrite = $sheetFile."_".$part.".xml";
            $fpWrite = fopen($filewrite, "w");
            $result = fwrite($fpWrite, '<worksheet><sheetData>'); 
            
            while (!feof($fpRead))
            {
                $dataTmp .= fgets($fpRead, 4096);
                
                $dataTmp = strstr($dataTmp, '<row '); // Отрезаем чтобы начало было <row
                $indexStartRow = strpos($dataTmp,'<row '); // IF Находим первый [<row ]
                
                while ($indexStartRow === 0) {
                    $indexFinishRow = strpos($dataTmp,'</row>');
                    if ($indexFinishRow > 0) { // Нашли [</row>]
                        if ($index % $partLimit == 0) { // Проверяем следует ли поменять файл
                            $result = fwrite($fpWrite, '</sheetData></worksheet>'); 
                            fclose($fpWrite);
                            $output[] = $filewrite;

                            /*
                            // Заливаем данные в БД
                            $dataXml = file_get_contents($filewrite);
                            $dataXml = preg_replace("/\s+/u", " ", $dataXml); // nbsp меняем на простой space
                            $result = $sql->fetch_object($sql->query($query,$documentId,$uploadId,$sheetId,$part,$guid,$dataXml));
                            if (@$result->message) error_log($result->message);
                            unset($dataXml);
                            */

                            $part++;
                            $filewrite = $sheetFile."_".$part.".xml";
                            $fpWrite = fopen($filewrite, "w");
                            $result = fwrite($fpWrite, '<worksheet><sheetData>'); 
                        }
                        $rowData = substr($dataTmp,0,$indexFinishRow+6);
                        foreach($xmlnsArray as $key => $val) {
                            $rowData = str_replace(' '.$val.':', ' ', $rowData);
                        }
                        $result = fwrite($fpWrite, $rowData);
                        
                        $index++;
                        $dataTmp = strstr($dataTmp, '</row>');
                        $dataTmp = substr($dataTmp, 6, strlen($dataTmp)); // Отрезаем чтобы начало было без </row>
                        $indexStartRow = strpos($dataTmp,'<row '); // IF Находим первый [<row ]
                    } else {
                        break; // Не нашли [</row>]
                    }
                }
            }
            $result = fwrite($fpWrite, '</sheetData></worksheet>'); 
            fclose($fpWrite); //
            $output[] = $filewrite;
            
            /*
            // Заливаем данные в БД
            $dataXml = file_get_contents($filewrite);
            $dataXml = preg_replace("/\s+/u", " ", $dataXml); // nbsp меняем на простой space
            $result = $sql->fetch_object($sql->query($query,$documentId,$uploadId,$sheetId,$part,$guid,$dataXml));
            if (@$result->message) error_log($result->message);
            
            unset($dataXml);
            */
            fclose($fpRead); // Закрытие файла
        }
    }
}
