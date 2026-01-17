import com.sap.gateway.ip.core.customdev.util.Message;

def Message processData(Message message) {
    //Body 
    def body = message.getBody(java.lang.String);
    
    message.setProperty("InputJSONString",body);
     message.setProperty("original_payload",body);
    return message;
}