def custom_exception_handler(exc, context):
    from rest_framework.views import exception_handler
    
    response = exception_handler(exc, context)
    
    if response is not None and isinstance(response.data, dict):
        if 'message' in response.data and isinstance(response.data['message'], list):
            response.data['message'] = response.data['message'][0]
    
    return response