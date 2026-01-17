import com.sap.gateway.ip.core.customdev.util.Message;

def Message processData(Message message) {
    //Body 
    def body = message.getProperty("InputJSONString");
    message.setBody(body);
    return message;
}