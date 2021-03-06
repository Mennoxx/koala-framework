<?php
/**
 * execute everytime before render to check if it should use view-cache or render again
 *
 * The return value MUST NOT depend on any session stored data (eg. logged in user)
 *
 */
interface Kwf_Component_Plugin_Interface_UseViewCache
{
    public function useViewCache($renderer);
}
