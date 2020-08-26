function sprint_editor_simple($, params) {
    var $editor = $('.sp-x-editor' + params.uniqid);
    var $inputresult = $('.sp-x-result' + params.uniqid);
    var $form = $editor.closest('form').first();

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            popupToggle();
        }
    });

    $editor.on('keypress', 'input', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            return false;
        }
    });

    $form.on('click', function (e) {
        if (!$(e.target).hasClass('sp-x-btn')) {
            popupToggle();
        }
    });


    if (!params.jsonValue) {
        params.jsonValue = {};
    }

    if (!params.jsonValue.blocks) {
        params.jsonValue.blocks = [];
    }

    if (!params.jsonUserSettings) {
        params.jsonUserSettings = {};
    }

    if (params.hasOwnProperty('enableChange')) {
        params.enableChange = !!params.enableChange;
    } else {
        params.enableChange = true;
    }

    if (params.jsonUserSettings.hasOwnProperty('enable_change')) {
        params.enableChange = !!params.jsonUserSettings.enable_change;
    }

    params.enableChangeColumns = true;
    if (params.jsonUserSettings.hasOwnProperty('enable_change_columns')) {
        params.enableChangeColumns = !!params.jsonUserSettings.enable_change_columns;
    }

    params.deleteBlockAfterSortOut = true;
    if (params.jsonUserSettings.hasOwnProperty('delete_block_after_sort_out')) {
        params.deleteBlockAfterSortOut = !!params.jsonUserSettings.delete_block_after_sort_out;
    }

    layoutAdd();

    $.each(params.jsonValue.blocks, function (index, block) {
        block.layout = '0,0';
        blockAdd(block);
    });

    sprint_editor.listenEvent('focus', function () {
        checkClipboardButtons();
    });

    sprint_editor.listenEvent('copy', function () {
        checkClipboardButtons();
    });

    checkClipboardButtons();

    $form.on('submit', function (e) {
        //sprint_editor.deleteImagesBeforeSubmit();
        var resultString = saveToString();

        $editor.find('input,textarea,select').removeAttr('name');
        $inputresult.val(resultString);
    });

    if (params.enableChange) {

        $editor.on('click', '.sp-x-lt-block-paste', function (e) {
            e.preventDefault();

            var clipboardData = sprint_editor.getClipboard();
            var $box = $(this).closest('.sp-x-box');

            $.each(clipboardData, function (blockUid, blockData) {
                blockAdd(blockData.block, $box);
                if (blockData.deleteAfterPaste) {
                    boxDelete(
                        $editor.find('.sp-x-box[data-uid=' + blockUid + ']')
                    );
                }
            });

            sprint_editor.clearClipboard();
        });

        $editor.on('click', '.sp-x-pp-blocks .sp-x-btn', function (e) {
            addByName($(this));
        });

        $editor.on('click', '.sp-x-lastblock', function (e) {
            addByName($(this));
        });

        $editor.on('click', '.sp-x-pp-main .sp-x-btn', function (e) {
            addByName($(this));
        });

        $editor.on('click', '.sp-x-pp-lt-open', function (e) {
            popupToggle($(this));
        });

        $editor.on('click', '.sp-x-pp-main-open', function (e) {
            popupToggle($(this));
        });

        $editor.on('click', '.sp-x-pp-box-open', function (e) {
            popupToggle($(this));
        });

        $editor.on('click', '.sp-x-pp-blocks-open', function (e) {
            popupToggle($(this));
        });

        $editor.on('click', '.sp-x-box-copy', function (e) {
            e.preventDefault();
            var $box = $(this).closest('.sp-x-box');
            sprint_editor.copyToClipboard($box.data('uid'), false);
            popupToggle();
        });

        $editor.on('click', '.sp-x-box-cut', function (e) {
            e.preventDefault();
            var $box = $(this).closest('.sp-x-box');
            sprint_editor.copyToClipboard($box.data('uid'), true);
            popupToggle();
        });

        $editor.on('click', '.sp-x-box-up', function (e) {
            e.preventDefault();

            var $block = $(this).closest('.sp-x-box');
            var $grid = $(this).closest('.sp-x-lt');

            var $nblock = $block.prev('.sp-x-box');
            if ($nblock.length > 0) {
                $block.insertBefore($nblock);
                sprint_editor.afterSort($block.data('uid'));
            } else {
                var $ngrid = $grid.prev('.sp-x-lt');
                if ($ngrid.length > 0) {
                    var $ncol = getActiveColumn($ngrid);
                    $block.appendTo($ncol);
                    sprint_editor.afterSort($block.data('uid'));
                }
            }
        });

        $editor.on('click', '.sp-x-box-dn', function (e) {
            e.preventDefault();

            var $block = $(this).closest('.sp-x-box');
            var $grid = $(this).closest('.sp-x-lt');

            var $nblock = $block.next('.sp-x-box');
            if ($nblock.length > 0) {
                $block.insertAfter($nblock);
                sprint_editor.afterSort($block.data('uid'));

            } else {
                var $ngrid = $grid.next('.sp-x-lt');
                if ($ngrid.length > 0) {
                    var $ncol = getActiveColumn($ngrid);
                    var $head = $ncol.find('.sp-x-lt-settings');
                    if ($head.length > 0) {
                        $ncol = $head;
                    }
                    $block.insertAfter($ncol);
                    sprint_editor.afterSort($block.data('uid'));
                }
            }
        });

        $editor.on('click', '.sp-x-box-del', function (e) {
            e.preventDefault();
            var $box = $(this).closest('.sp-x-box');
            boxDelete($box);
        });
    }


    $editor.on('click', '.sp-x-box-settings span', function (e) {
        var $span = $(this);

        $span.siblings('span').removeClass('sp-active');

        if ($span.hasClass('sp-active')) {
            $span.removeClass('sp-active');
        } else {
            $span.addClass('sp-active');
        }
    });


    function popupToggle($handler) {

        function popupHide() {
            $editor.find('.sp-x-pp-box').hide();
            $editor.find('.sp-x-pp-lt').hide();
            $editor.find('.sp-x-pp-blocks').hide();
            $editor.find('.sp-x-pp-main').hide();
            $editor.find('.sp-x-pp-box-open').removeClass('sp-active');
            $editor.find('.sp-x-pp-lt-open').removeClass('sp-active');
            $editor.find('.sp-x-pp-blocks-open').removeClass('sp-active');
            $editor.find('.sp-x-pp-main-open').removeClass('sp-active');
        }


        if (!$handler) {
            popupHide();
            return true;
        }

        var $popup;

        if ($handler.hasClass('sp-x-pp-lt-open')) {
            $popup = $handler.closest('.sp-x-buttons').find('.sp-x-pp-lt');
        } else if ($handler.hasClass('sp-x-pp-box-open')) {
            $popup = $handler.closest('.sp-x-buttons').find('.sp-x-pp-box');
        } else if ($handler.hasClass('sp-x-pp-main-open')) {
            $popup = $handler.closest('.sp-x-buttons').find('.sp-x-pp-main');
        } else if ($handler.hasClass('sp-x-pp-blocks-open')) {
            $popup = $editor.find('.sp-x-pp-blocks');
            if (!$popup || $popup.length <= 0) {
                $popup = $(sprint_editor.renderTemplate('pp-blocks' + params.uniqid, {}));
            }

            $handler.after($popup);
        }

        if (!$popup) {
            popupHide();
            return true;
        }

        if ($handler.hasClass('sp-active')) {
            $handler.removeClass('sp-active');
            $popup.hide();
        } else {
            popupHide();
            $handler.addClass('sp-active');
            $popup.show();
        }
    }

    function addByName($handler) {
        var name = $handler.data('name');
        if (!name) {
            return false;
        }

        if (name.indexOf('layout_') === 0) {
            console.log('not work in simple version');
        } else if (name.indexOf('pack_') === 0) {
            console.log('not work in simple version');
        } else if (name === 'delete_pack') {
            console.log('not work in simple version');
        } else if (name === 'save_pack') {
            console.log('not work in simple version');
        } else if (name) {
            var $grid = $handler.closest('.sp-x-lt');
            var $col = getActiveColumn($grid);
            if ($col.length > 0) {
                var $box = blockAdd({name: name}, $col);

                if ($box && !$handler.hasClass('sp-x-lastblock')) {
                    $box.closest('.sp-x-lt').find('.sp-x-lastblock').html(
                        BX.message('SPRINT_EDITOR_add') + ' ' +
                        sprint_editor.getBlockTitle(name)
                    ).data('name', name).show();
                }
            }
            popupToggle();
            checkClipboardButtons();
        }
    }

    function checkClipboardButtons() {
        var clipboardData = sprint_editor.getClipboard();

        var cntBlocks = 0;

        $editor.find('.sp-x-box')
            .removeClass('sp-x-box-copied')
            .removeClass('sp-x-box-cutted')
        ;

        $.each(clipboardData, function (blockUid, blockData) {
            var $box = $editor.find('.sp-x-box[data-uid=' + blockUid + ']');
            if ($box.length > 0) {
                if (blockData.deleteAfterPaste) {
                    $box.addClass('sp-x-box-cutted');
                } else {
                    $box.addClass('sp-x-box-copied');
                }
            }
            cntBlocks++;
        });

        if (cntBlocks > 0) {
            $editor.find('.sp-x-lt-col-paste').show();
            $editor.find('.sp-x-lt-block-paste').show();
        } else {
            $editor.find('.sp-x-lt-col-paste').hide();
            $editor.find('.sp-x-lt-block-paste').hide();
        }
    }

    function layoutAdd() {
        if (params.enableChange) {
            sortableBlocks($editor.find('.sp-x-lt-col').last());
        }
    }

    function sortableBlocks($column) {
        var removeIntent = false;

        $column.sortable({
            items: ".sp-x-box",
            connectWith: ".sp-x-lt-col",
            handle: ".sp-x-box-handle",
            placeholder: "sp-x-box-placeholder",
            over: function () {
                removeIntent = false;
            },
            out: function () {
                removeIntent = true;
            },
            beforeStop: function (event, ui) {
                var uid = ui.item.data('uid');
                if (removeIntent && params.deleteBlockAfterSortOut) {
                    sprint_editor.beforeDelete(uid);
                    ui.item.remove();
                } else {
                    sprint_editor.afterSort(uid);
                }
            }
        })
    }

    function boxDelete($box) {
        var uid = $box.data('uid');
        sprint_editor.beforeDelete(uid);

        $box.hide(250, function () {
            $box.remove();
        });
    }

    function blockAdd(blockData, $column) {
        if (!blockData || !blockData.name) {
            return false;
        }

        if (!sprint_editor.hasBlockParams(blockData.name)) {
            return false;
        }

        var uid = sprint_editor.makeUid();
        var blockSettings = sprint_editor.getBlockSettings(blockData.name, params);
        var $box = $(sprint_editor.renderBlock(blockData, blockSettings, uid, params));

        if (!$column || $column.length <= 0) {
            if (blockData.layout) {
                var pos = blockData.layout.split(',');
                var $grid = $editor.find('.sp-x-lt').eq(pos[0]);
                $column = $grid.find('.sp-x-lt-col').eq(pos[1]);
            }
        }

        if (!$column || $column.length <= 0) {
            return false;
        }

        if ($column.hasClass('sp-x-box')) {
            $box.insertAfter($column);
        } else {
            $column.append($box);
        }

        var $el = $box.find('.sp-x-box-block');
        var entry = sprint_editor.initblock($, $el, blockData.name, blockData, blockSettings);

        sprint_editor.initblockAreas($, $el, entry);
        sprint_editor.registerEntry(uid, entry);

        return $box;
        // scrollTo($el);
    }

    function saveToString(packname) {
        packname = packname || '';

        var blocks = [];

        $editor.find('.sp-x-lt').each(function (gindex) {
            $(this).find('.sp-x-lt-col').each(function (cindex) {
                $(this).find('.sp-x-box').each(function () {

                    var uid = $(this).data('uid');

                    if (!sprint_editor.hasEntry(uid)) {
                        return true;
                    }

                    var blockData = sprint_editor.collectData(uid);

                    var settcnt = 0;
                    var settval = {};
                    var $boxsett = $(this).find('.sp-x-box-settings');
                    $boxsett.find('.sp-x-box-settings-group').each(function () {
                        var name = $(this).data('name');
                        var $val = $(this).find('.sp-active').first();

                        if ($val.length > 0) {
                            settval[name] = $val.data('value');
                            settcnt++;
                        }
                    });

                    if (settcnt > 0) {
                        blockData.settings = settval;
                    } else {
                        delete blockData.settings;
                    }

                    blockData.layout = '0,0';
                    blocks.push(blockData);
                });

            });
        });

        var resultString = '';

        if (blocks.length > 0) {
            resultString = sprint_editor.safeStringify({
                packname: packname,
                version: 2,
                blocks: blocks,
                layouts: [
                    {
                        columns: [
                            {
                                css: ''
                            }
                        ]
                    }
                ]
            });
        }

        return resultString;
    }

    function getActiveColumn($grid) {
        return $grid.find('.sp-x-lt-col.sp-active');
    }
}
