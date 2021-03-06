<?php
class Kwf_Model_DbWithConnection_SiblingRelationExpr_RelationSiblingModel extends Kwf_Model_Db
{
    protected $_referenceMap = array(
        'Relation' => array(
            'refModelClass' => 'Kwf_Model_DbWithConnection_SiblingRelationExpr_RelationModel',
            'column' => 'id',
        )
    );
    protected $_tableName;
    public function __construct()
    {
        $this->_tableName = 'relation_sibling'.uniqid();
        $config['table'] = $this->_tableName;
        Kwf_Registry::get('db')->query("CREATE TABLE {$this->_tableName} (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
            `foo` INT NOT NULL
        ) ENGINE = INNODB");
        Kwf_Registry::get('db')->query("INSERT INTO {$this->_tableName}
                        (id, foo) VALUES ('1', 123)");
        Kwf_Registry::get('db')->query("INSERT INTO {$this->_tableName}
                        (id, foo) VALUES ('2', 321)");
        parent::__construct($config);
    }

    public function dropTable()
    {
        Kwf_Registry::get('db')->query("DROP TABLE IF EXISTS {$this->_tableName}");
    }

}
