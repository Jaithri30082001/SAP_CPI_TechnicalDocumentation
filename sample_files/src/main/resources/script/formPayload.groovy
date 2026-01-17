import com.sap.gateway.ip.core.customdev.util.Message;
import java.util.HashMap;
import groovy.json.*;
import groovy.util.*;
import groovy.xml.*;
import org.codehaus.*;
import java.util.HashMap;

def Message processData(Message message) {
     
     // Read Response Body
     def body_json=  message.getProperty("InputJSONString") as String;
     def jsonSlurper = new JsonSlurper();
     def inputPayload = jsonSlurper.parseText(body_json);
     def builder = new JsonBuilder();
     def result = [
         CustomerReturnType: inputPayload.targetType.targetType.code,
         SalesOrganization: inputPayload.parentID.salesOrganization.salesOrganization,
         DistributionChannel: inputPayload.parentID.distributionChannel.distributionChannel,
         OrganizationDivision: inputPayload.parentID.division.salesDivision,
         SoldToParty: "",
         PurchaseOrderByCustomer: inputPayload.parentID.externalReference,
         to_Item: [
             results: [
            ]
         ]
     ]
     if(inputPayload.parentID.soldToParty != null) {
        result.SoldToParty = inputPayload.parentID.soldToParty.customerCode;
     }
     
     if(inputPayload.parentID.combineItems[0].containsKey("referenceDocumentNumber")){
        result.ReferenceSDDocument = inputPayload.parentID.combineItems[0].referenceDocumentNumber;
     }
     
     
     def CustomerReturnItemCategory, ReturnReason;
     if(inputPayload.targetType.targetItemCategoryCode != null) {
         CustomerReturnItemCategory = inputPayload.targetType.targetItemCategoryCode;
     } else {
         CustomerReturnItemCategory = inputPayload.parentID.itemCategory.code;
     }
     
     if(inputPayload.parentID.containsKey("complaintReason")){
         ReturnReason = inputPayload.parentID.complaintReason != null ?  inputPayload.parentID.complaintReason.code : "";
     }
     
     inputPayload.parentID.combineItems.each{ item ->
        if(item.containsKey("confirmationStatus_code") && item.confirmationStatus_code == "REL"){
            def Material = '', 
                RequestedQuantity = '', 
                CustRetItmFollowUpActivity = '', 
                ReferenceSDDocument = '', 
                ReferenceSDDocumentItem = '';
                CustomerReturnItem = '';
            if(item.containsKey("itemNumber") && item.itemNumber != null){
                CustomerReturnItem = item.itemNumber;
            }    
            if(inputPayload.targetType.useReferenceMaterial){
                Material = (item.containsKey("referenceMaterial") && item.referenceMaterial != null) ? item.referenceMaterial.materialCode : "";
                if(item.containsKey("referenceMaterial") && item.containsKey("complaintMaterial")){
                    if(item.referenceMaterial != null && item.complaintMaterial != null){
                        if(item.containsKey("referenceDocumentNumber") && item.referenceDocumentNumber != null){
                            ReferenceSDDocument = (item.referenceMaterial.materialCode == item.complaintMaterial.materialCode ) ? item.referenceDocumentNumber : "";
                            ReferenceSDDocumentItem = (item.referenceMaterial.materialCode == item.complaintMaterial.materialCode ) ? item.referenceDocumentLineItemNumber : "";
                        }
                    }
                }
            } else {
                Material = (item.containsKey("complaintMaterial") && item.complaintMaterial != null) ? item.complaintMaterial.materialCode : "";
            }
            if(item.containsKey("complaintQuantity")){
                RequestedQuantity = item.complaintQuantity != null ? item.complaintQuantity : "";
            }
            if(item.containsKey("returnLocation")){
                ProductionPlant = item.returnLocation != null ? item.returnLocation.plant : "";
            }
            if(item.containsKey("returnFollowupType")){
                CustRetItmFollowUpActivity = item.returnFollowupType != null ? item.returnFollowupType.code : "";
            }
            
            
            def items = [
                CustomerReturnItemCategory: CustomerReturnItemCategory,
                CustomerReturnItem: CustomerReturnItem,
                Material: Material,
                RequestedQuantity: RequestedQuantity,
                ProductionPlant: ProductionPlant,
                ReturnReason: ReturnReason,
                CustRetItmFollowUpActivity: CustRetItmFollowUpActivity,
                ReturnsRefundProcgMode: "R",
                ReferenceSDDocument: ReferenceSDDocument,
                ReferenceSDDocumentItem: ReferenceSDDocumentItem
            ]
            result.to_Item.results.push(items);
        }
     }
     results = JsonOutput.toJson( result );
     message.setBody(results);
     return message;
}

