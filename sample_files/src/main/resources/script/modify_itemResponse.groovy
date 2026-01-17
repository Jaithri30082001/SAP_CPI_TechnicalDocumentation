import com.sap.gateway.ip.core.customdev.util.Message;
import groovy.json.JsonSlurper
import groovy.json.JsonBuilder

def Message processData(Message message) {
     
     // Read Response Body
     def body_json= message.getBody(java.lang.String) as String;
     def jsonSlurper = new JsonSlurper();
     try{
         def result = jsonSlurper.parseText(body_json);
         def customerReturnItemList = []
         if(result.A_CustomerReturnItem.A_CustomerReturnItemType instanceof ArrayList){
             customerReturnItemList = result.A_CustomerReturnItem.A_CustomerReturnItemType
         }else{
             customerReturnItemList.add(result.A_CustomerReturnItem.A_CustomerReturnItemType)
         }
         def customerReturnItemListJson = new JsonBuilder(customerReturnItemList)
         message.setHeader("customerReturnItemResult", customerReturnItemListJson)
         message.setHeader("errorMessage", "");
     }
     catch(Exception e)
     {
         message.setHeader("result", "");
         message.setHeader("errorMessage", "");
     }
     return message;
}

