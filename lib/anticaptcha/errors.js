class ApiError extends Error {
  constructor(id, code, message) {
    super(message);
    this.name = this.constructor.name;
    this.id = id;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

const ERRORS = {
  ApiError,
};

[
  [1, 'ERROR_KEY_DOES_NOT_EXIST', 'Account authorization key not found in the system'],
  [2, 'ERROR_NO_SLOT_AVAILABLE', 'No idle workers are available at the moment. Please try a bit later or increase your maximum bid in menu Settings - API Setup in Anti-Captcha Customers Area.'],
  [3, 'ERROR_ZERO_CAPTCHA_FILESIZE', 'The size of the captcha you are uploading is less than 100 bytes.'],
  [4, 'ERROR_TOO_BIG_CAPTCHA_FILESIZE', 'The size of the captcha you are uploading is more than 500,000 bytes.'],
  [10, 'ERROR_ZERO_BALANCE', 'Account has zeo or negative balance'],
  [11, 'ERROR_IP_NOT_ALLOWED', 'Request with current account key is not allowed from your IP. Please refer to IP list section located here'],
  [12, 'ERROR_CAPTCHA_UNSOLVABLE', 'Captcha could not be solved by 5 different workers'],
  [13, 'ERROR_BAD_DUPLICATES', '100% recognition feature did not work due to lack of amount of guess attempts'],
  [14, 'ERROR_NO_SUCH_METHOD', 'Request to API made with method which does not exist'],
  [15, 'ERROR_IMAGE_TYPE_NOT_SUPPORTED', 'Could not determine captcha file type by its exif header or image type is not supported. The only allowed formats are JPG, GIF, PNG'],
  [16, 'ERROR_NO_SUCH_CAPCHA_ID', 'Captcha you are requesting does not exist in your current captchas list or has been expired. Captchas are removed from API after 5 minutes after upload.'],
  [20, 'ERROR_EMPTY_COMMENT', '"comment" property is required for this request'],
  [21, 'ERROR_IP_BLOCKED', 'Your IP is blocked due to API inproper use. Check the reason at https://anti-captcha.com/panel/tools/ipsearch'],
  [22, 'ERROR_TASK_ABSENT', 'Task property is empty or not set in createTask method. Please refer to API v2 documentation.'],
  [23, 'ERROR_TASK_NOT_SUPPORTED', 'Task type is not supported or inproperly printed. Please check "type" parameter in task object.'],
  [24, 'ERROR_INCORRECT_SESSION_DATA', 'Some of the required values for successive user emulation are missing.'],
  [25, 'ERROR_PROXY_CONNECT_REFUSED', 'Could not connect to proxy related to the task, connection refused'],
  [26, 'ERROR_PROXY_CONNECT_TIMEOUT', 'Could not connect to proxy related to the task, connection timeout'],
  [27, 'ERROR_PROXY_READ_TIMEOUT', 'Connection to proxy for task has timed out'],
  [28, 'ERROR_PROXY_BANNED', 'Proxy IP is banned by target service'],
  [29, 'ERROR_PROXY_TRANSPARENT', 'Task denied at proxy checking state. Proxy must be non-transparent to hide our server IP.'],
  [30, 'ERROR_RECAPTCHA_TIMEOUT', 'Recaptcha task timeout, probably due to slow proxy server or Google server'],
  [31, 'ERROR_RECAPTCHA_INVALID_SITEKEY', 'Recaptcha server reported that site key is invalid'],
  [32, 'ERROR_RECAPTCHA_INVALID_DOMAIN', 'Recaptcha server reported that domain for this site key is invalid'],
  [33, 'ERROR_RECAPTCHA_OLD_BROWSER', 'Recaptcha server reported that browser user-agent is not compatible with their javascript'],
  [34, 'ERROR_TOKEN_EXPIRED', 'Captcha provider server reported that additional variable token has been expired. Please try again with new token.'],
  [35, 'ERROR_PROXY_HAS_NO_IMAGE_SUPPORT', 'Proxy does not support transfer of image data from Google servers'],
  [36, 'ERROR_PROXY_INCOMPATIBLE_HTTP_VERSION', 'Proxy does not support long GET requests with length about 2000 bytes and does not support SSL connections'],
  [37, 'ERROR_FACTORY_SERVER_API_CONNECTION_FAILED', 'Could not connect to Factory Server API within 5 seconds'],
  [38, 'ERROR_FACTORY_SERVER_BAD_JSON', 'Incorrect Factory Server JSON response, something is broken'],
  [39, 'ERROR_FACTORY_SERVER_ERRORID_MISSING', 'Factory Server API did not send any errorId'],
  [40, 'ERROR_FACTORY_SERVER_ERRORID_NOT_ZERO', 'Factory Server API reported errorId != 0, check this error'],
  [41, 'ERROR_FACTORY_MISSING_PROPERTY', 'Some of the required property values are missing in Factory form specifications. Customer must send all required values.'],
  [42, 'ERROR_FACTORY_PROPERTY_INCORRECT_FORMAT', 'Expected other type of property value in Factory form structure. Customer must send specified value type.'],
  [43, 'ERROR_FACTORY_ACCESS_DENIED', 'Factory control belong to another account, check your account key.'],
  [44, 'ERROR_FACTORY_SERVER_OPERATION_FAILED', 'Factory Server general error code'],
  [45, 'ERROR_FACTORY_PLATFORM_OPERATION_FAILED', 'Factory Platform general error code.'],
  [46, 'ERROR_FACTORY_PROTOCOL_BROKEN', 'Factory task lifetime protocol broken during task workflow.'],
  [47, 'ERROR_FACTORY_TASK_NOT_FOUND', 'Task not found or not available for this operation'],
  [48, 'ERROR_FACTORY_IS_SANDBOXED', 'Factory is sandboxed, creating tasks is possible only by Factory owner. Switch it to production mode to make it available for other customers.'],
  [49, 'ERROR_PROXY_NOT_AUTHORISED', 'Proxy login and password are incorrect'],
  [50, 'ERROR_FUNCAPTCHA_NOT_ALLOWED', 'Customer did not enable Funcaptcha Proxyless tasks in Customers Area - API Settings. All customers must read terms, pass mini test and sign/accept the form before being able to use this feature.'],
  [51, 'ERROR_INVISIBLE_RECAPTCHA', 'Recaptcha was attempted to be solved as usual one, instead of invisible mode. Basically you don\'t need to do anything when this error occurs, just continue sending tasks with this domain. Our system will self-learn to solve recaptchas from this sitekey in invisible mode.'],
  [52, 'ERROR_FAILED_LOADING_WIDGET', 'Could not load captcha provider widget in worker browser. Please try sending new task.'],
].forEach(([id, code, message]) => {
  const error = new ApiError(id, code, message);
  ERRORS[id] = error;
  ERRORS[code] = error;
});

module.exports = ERRORS;
