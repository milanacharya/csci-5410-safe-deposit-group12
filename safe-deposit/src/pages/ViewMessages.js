import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from './Navigation';
import { Container, Table, Row, Col } from "react-bootstrap";
import { Helmet } from 'react-helmet'

const dynamoAPI = process.env.REACT_APP_DYNAMO_API;

function ViewMessages() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        async function getMessages() {
            await axios.get(dynamoAPI + 'messages/' + sessionStorage.getItem('userId')).then(response => {
                setMessages(response.data.data);
            });
        }
        getMessages();
    }, [])

    const getDate = date => {
        var conv_date = new Date(date * 1);
        return conv_date.toUTCString();
    }

    return (
        <>
            <Helmet>
                <title>View Message</title>
            </Helmet>
            <Navigation />
            <Container className="p-5 mb-4 rounded-3" style={{ display: 'flex' }}>
                {(messages.length > 0) ?
                    <Row className="mx-auto">
                        <Col>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Sender</th>
                                        <th>Deposit Box</th>
                                        <th>Message</th>
                                        <th>Read</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((item) => {
                                        return (
                                            <tr>
                                                <td>{getDate(item.timestamp)}</td>
                                                <td>{item.senderId}</td>
                                                <td>{item.boxId}</td>
                                                <td>{item.message}</td>
                                                <td>{item.read ? "Yes" : "No"}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    : <Row className="mx-auto"><Col><h5>You have no messages</h5></Col></Row>}
            </Container>
        </>
    );
}

export default ViewMessages;