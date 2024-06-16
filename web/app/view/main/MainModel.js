/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('MaxiMary.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',

    data: {
        name: 'Отцы и Дети',

        description: `
            <h1>Описание продукта</h1>

            <h3>17. МАРШРУТИЗАЦИЯ СУДОВ В УСЛОВИЯХ СЕВЕРНОГО МОРСКОГО ПУТИ</h3>

            <p><strong>ТРЕБОВАНИЯ</strong></p>
            <p>
                Разработать сервис для формирования каравана и построения его оптимального маршрута<br />
                на основе динамических данных о ледовой проходимости<br />
                и фиксированного графа переходов судов по Северному морскому пути.
            </p>


            <p><strong>ПРИМЕРЫ ФАЙЛОВ ДЛЯ ЗАГРУЗКИ В СИСТЕМУ</strong></p>
            <ul>
                <li><a href="resources/data/InputData_(with_all_ice).xlsx" target="_blank">InputData_(with_all_ice).xlsx</a></li>
                <li><a href="resources/data/InputData_(with_one_day_ice).xlsx" target="_blank">InputData_(with_one_day_ice).xlsx</a></li>
                <li><a href="resources/data/InputData_(with_two_day_ice).xlsx" target="_blank">InputData_(with_two_day_ice).xlsx</a></li>
                <li><a href="resources/data/InputData_(without_ice).xlsx" target="_blank">InputData_(without_ice).xlsx</a></li>
            </ul>

            <h3><a href="https://github.com/moxsim/nsr-leaders-contest" target="_blank">ССЫЛКА НА РЕПОЗИТОРИЙ</a></h3>

            <h3><a href="#" target="_blank">ССЫЛКА НА ОБЗОРНОЕ ВИДЕО</a></h3>

            <h3><a href="https://disk.yandex.ru/i/I7Rhm3IW5RnTXw" target="_blank">ССЫЛКА НА ДОКУМЕНТАЦИЮ</a></h3>

            <h3><a href="https://disk.yandex.ru/i/qBdYnJbpJEMN2Q" target="_blank">ССЫЛКА НА ПРЕЗЕНТАЦИЮ</a></h3>
        `
    }

    //TODO - add data, formulas and/or methods to support your view
});
