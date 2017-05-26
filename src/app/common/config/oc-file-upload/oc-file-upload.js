angular.module('orderCloud')
    .config(function($provide, $injector) {
        var awsaccesskeyid = $injector.has('awsaccesskeyid') ? $injector.get('awsaccesskeyid') : null;
        var awssecretaccesskey = $injector.has('awssecretaccesskey') ? $injector.get('awssecretaccesskey') : null;
        var awsregion = $injector.has('awsregion') ? $injector.get('awsregion') : null;
        var awsbucket = $injector.has('awsbucket') ? $injector.get('awsbucket') : null;

        $provide.value('awsaccesskeyid', awsaccesskeyid || 'AKIAJDDM5ZWWOIH4AZZQ');
        $provide.value('awssecretaccesskey', awssecretaccesskey || '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');
        $provide.value('awsregion', awsregion || 'us-west-2');
        $provide.value('awsbucket', awsbucket || 'marketplace-application-test');
    })
;