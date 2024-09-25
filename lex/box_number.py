import boto3

dynamo_client = boto3.resource('dynamodb')
data_table = dynamo_client.Table("users")


def lambda_handler(event, context):

    user_box_id = event['currentIntent']['slots']['reg']
    print("User ID is: "+user_box_id)
    get_response = data_table.get_item(
        Key={"userId": user_box_id})
    fetch_item = get_response["Item"]
    print(fetch_item)
    box = fetch_item['boxes']
    print(box)

    return {
        "dialogAction": {
            "type": "Close",
            "fulfillmentState": "Fulfilled",
            "message": {
                "contentType": "PlainText",
                "content": "For user:"+str(user_box_id)+" has "+str(box)
            }
        }
    }
