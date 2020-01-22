<?php

// TOOD: Are we using http or https here?
define('REDIRECT_URI', 'https://'.$_SERVER['HTTP_HOST'].'/scale/index.html');
define('OAUTH_KEY', '34dcJfG2DZRwFj9');
define('OAUTH_SECRET', 'rvk7M5vAyACw3Dz');

function array_to_querystring($data) {
  $query = array();
  foreach($data as $key => $value) {
    array_push($query, "$key=".rawurlencode($value));
  }
  return rawurlencode(implode("&", $query));
}

//snippet written by Kellan Elliott-McCrea; http://laughingmeme.org/
function hmacsha1($key, $data) {
  $blocksize = 64;
  $hashfunc = 'sha1';
  if (strlen($key) > $blocksize)
    $key = pack('H*', $hashfunc($key));
  $key = str_pad($key, $blocksize, chr(0x00));
  $ipad = str_repeat(chr(0x36), $blocksize);
  $opad = str_repeat(chr(0x5c), $blocksize);
  $hmac = pack('H*', $hashfunc(($key ^ $opad) . pack('H*', $hashfunc(($key ^ $ipad) . $data))));
  return $hmac;
}

$oauth = array_intersect_key($_POST, array(
  'oauth_consumer_key' => 0,
  'oauth_signature_method'=> 0,
  'oauth_timestamp' => 0,
  'oauth_nonce' => 0,
  'oauth_version' => 0,
  'oauth_signature' => 0,
  'oauth_callback' => 0,
));
ksort($_POST);
unset($_POST['oauth_signature']);
$post_data = array_to_querystring($_POST);
$base_string = "POST&".
             rawurlencode("https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']).
             "&".$post_data;
$sig = base64_encode(hmacsha1(urlencode(OAUTH_SECRET) . '&', $base_string));
$querystring = '';
if (strcmp($oauth['oauth_signature'], $sig) == 0) {
  $querystring = array_to_querystring(array(
	'gid' => $_POST['custom_gid'],
    'userID' => $_POST['user_id'],
    'roles' => $_POST['roles'],
    'fullName' => $_POST['lis_person_name_full'],
    'familyName' => $_POST['lis_person_name_family'],
    'givenName' => $_POST['lis_person_name_given'],
    'email' => $_POST['lis_person_contact_email_primary'],
    'userImage' => $_POST['user_image'],
    'contextID' => $_POST['context_id'],
    'contextType' => $_POST['context_type'],
    'contextTitle' => $_POST['context_title'],
	'contextLabel' => $_POST['context_label']
  ));
}
header('Location: '.REDIRECT_URI."?".$querystring);
exit();
/*
https://viseyes.org/scale/lti.php
34dcJfG2DZRwFj9
rvk7M5vAyACw3Dz
https://viseyes.org/scale?1LSnAM3A62AQipZfqxDtlOjt4MWJ0fBP22cdyqJqEj5M
*/
?>