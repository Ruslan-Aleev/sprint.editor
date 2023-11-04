sprint_editor.registerBlock('complex_video_text', function ($, $el, data) {
    var areas = [
        {
            dataKey: 'video',
            blockName: 'video',
            container: '.sp-area1'
        },
        {
            dataKey: 'text',
            blockName: 'text',
            container: '.sp-area2'
        }
    ];

    this.getData = function () {
        return data;
    };

    this.collectData = function () {
        return data;
    };

    this.getAreas = function () {
        return areas;
    };
});
