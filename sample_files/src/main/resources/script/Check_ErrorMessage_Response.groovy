import com.sap.gateway.ip.core.customdev.util.Message;
import java.util.HashMap;
import groovy.json.*;
import groovy.util.*;
import groovy.xml.*;
import org.codehaus.*;
import java.util.HashMap;

def Message processData(Message message) {

     def body_xml= message.getBody(java.lang.String) as String;
     try{
         Node root = new XmlParser().parseText(body_xml);
         def msg = root.message.text();
         def errordetails = root.innererror.errordetails;
         errordetails.each { node ->
            def errorMessage = node.errordetail.message.text();
            msg = msg + errorMessage;
         }
         message.setHeader("errorMessage", msg);
     }
     catch(Exception e)
     {
        def map  = message.getProperties();
        def ex   = map.get("CamelExceptionCaught");
        if (ex != null)
        {
           exceptionText    = ex.getMessage();
           message.setHeader("errorMessage", exceptionText);
        }else{
             message.setHeader("errorMessage", "");
        }
     }
     return message;
}

