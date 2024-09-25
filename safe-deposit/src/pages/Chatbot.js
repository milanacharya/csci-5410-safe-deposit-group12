import LexChat from "react-lex-plus";
import AWS from "aws-sdk";

function Chatbot() {
    AWS.config.region = "us-east-1"; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-east-1:cf893a58-4cba-4555-9e75-0959e3d6bd1a",
    });

    return (
        <>
            <LexChat
                botName="latenightbot"
                IdentityPoolId="us-east-1:cf893a58-4cba-4555-9e75-0959e3d6bd1a"
                placeholder="Placeholder text"
                backgroundColor="#FFFFFF"
                height="430px"
                region="us-east-1"
                headerText="Virtual Support Assistant"
                headerStyle={{ backgroundColor: "#0e6dfb", fontSize: "24px" }}
                greeting={"Welcome to SafeDeposit."}
            />
        </>
    )
}

export default Chatbot;