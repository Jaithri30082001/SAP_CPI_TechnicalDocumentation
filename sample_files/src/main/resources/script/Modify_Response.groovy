import com.sap.gateway.ip.core.customdev.util.Message;
import groovy.json.JsonSlurper;

def Message processData(Message message) {
     
     // Read Response Body
     def body_json= message.getBody(java.lang.String) as String;
     def jsonSlurper = new JsonSlurper();
     try{
         def result = jsonSlurper.parseText(body_json);
         message.setHeader("result", result.A_CustomerReturn.A_CustomerReturnType.CustomerReturn);
         message.setHeader("errorMessage", "");
     }
     catch(Exception e)
     {
         message.setHeader("result", "");
         message.setHeader("errorMessage", "");
     }
     return message;
}

