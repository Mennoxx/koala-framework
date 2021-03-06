<?php
class Kwc_Trl_NewsCategories_News_TestModel extends Kwc_NewsCategory_Model
{
    protected $_dependentModels = array(
        'Categories' => 'Kwc_Trl_NewsCategories_News_Category_NewsToCategoriesTestModel'
    );

    public function __construct()
    {
        $data = array(
            array('id'=>'1', 'component_id'=>'root-master_test', 'visible'=>true, 'title'=>'lipsum', 'teaser'=>'blablub', 'publish_date'=>'2010-03-01'),
            array('id'=>'2', 'component_id'=>'root-master_test', 'visible'=>true, 'title'=>'lipsum2', 'teaser'=>'blablub2', 'publish_date'=>'2010-03-01'),
        );
        $config = array(
            'proxyModel'=>new Kwf_Model_FnF(array(
                'data' => $data
            ))
        );
        parent::__construct($config);
    }
}
