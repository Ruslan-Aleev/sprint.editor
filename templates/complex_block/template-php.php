<?php
/**
 * @var $blockName
 * @var $layouts
 */
echo <<<HEAD
<?php 
/**
 * @var \$block array
 * @var \$this SprintEditorBlocksComponent
 */
?>
HEAD;
$aindex = 1;
$strings = [];

$strings[] = '<div class="sp-complex sp-' . $blockName . '">';
foreach ($layouts as $lindex => $layout) {
    $cnt = count($layout['columns']);

    if ($cnt > 1) {
        $strings[] = '<div class="sp-complex-table"><div class="sp-complex-row">';
    }
    foreach ($layout['columns'] as $column) {
        if ($cnt > 1) {
            $strings[] = '<div class="sp-complex-col">';
        }

        foreach ($column['blocks'] as $blockName) {
            $strings[] = '<?php $this->includeBlock($block[\'' . $blockName . $aindex . '\']);?>';
            $aindex++;
        }

        if ($cnt > 1) {
            $strings[] = '</div>';
        }
    }

    if ($cnt > 1) {
        $strings[] = '</div></div>';
    }
}

$strings[] = '</div>';

echo implode(PHP_EOL, $strings);


