import { useEffect, useState } from "react";
import axios from 'axios';
import Navigation from './Navigation';
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { Helmet } from 'react-helmet'

const dynamoAPI = process.env.REACT_APP_DYNAMO_API;
const storageAPI = process.env.REACT_APP_CLOUD_STORAGE_API;
const visionAPI = process.env.REACT_APP_VISION_AI_API;
const pubSubAPI = process.env.REACT_APP_PUB_SUB_API;

function SendMessages() {
    const [boxNumber, setBoxNumber] = useState('');
    const [boxNumbers, setBoxNumbers] = useState([]);
    const [userNumber, setUserNumber] = useState('');
    const [userNumbers, setUserNumbers] = useState([]);
    const [message, setMessage] = useState('');

    async function getUsersOfBox(boxId) {
        await axios.get(dynamoAPI + 'getdepositboxusers/' + boxId).then(response => {
            const users = [];
            response.data.data.forEach(user => {
                if (user !== sessionStorage.getItem('userId'))
                    users.push(user);
            });

            if (users.length > 0)
                setUserNumber(users[0]);
            setUserNumbers(users);
        });
    }

    useEffect(() => {
        async function getDepositBoxes() {
            await axios.get(dynamoAPI + 'getuserdepositboxes/' + sessionStorage.getItem('userId')).then(response => {
                setBoxNumber(response.data.data[0]);
                setBoxNumbers(response.data.data);
                getUsersOfBox(response.data.data[0]);
            });
        }
        getDepositBoxes();
    }, [])

    const handleChange = boxNumber => {
        setBoxNumber(boxNumber);
        getUsersOfBox(boxNumber);
    }

    const sendMessage = event => {
        event.preventDefault();

        var imagefile = document.querySelector('#img');
        var formData = new FormData();
        formData.append('file', imagefile.files[0]);
        formData.append('boxId', boxNumber);
        formData.append('userId', sessionStorage.getItem('userId'));
        var config = {
            headers: { 'Content-Type': 'multipart/form-data' }
        }

        axios.post(storageAPI + 'upload', formData, config).then(response => {
            axios.get(visionAPI + 'calculatescores/' + sessionStorage.getItem('userId') + '/' + userNumber + '/' + boxNumber).then(response => {
                if (response.data.data) {
                    const data = { senderId: sessionStorage.getItem('userId'), recipientId: userNumber, boxId: boxNumber, message: message }
                    fetch(pubSubAPI + 'publish', {
                        mode: 'cors',
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    }).then(response => {
                        if (response.ok) {
                            alert("Sent message to " + userNumber);
                        }
                        else {
                            alert("Failed to send message");
                        }
                    })
                } else {
                    alert("Images do not match. Message will not be sent");
                }
            }).catch(error => {
                alert("Failed to calculate scores");
                console.log("Error", error);
            });
        }).catch(error => {
            alert("Failed to upload image");
            console.log("Error", error);
        });
    }

    return (
        <>
            <Helmet>
                <title>Send Message</title>
            </Helmet>
            <Navigation />
            <Container className="p-5 mb-4 rounded-3" style={{ display: 'flex' }}>
                {(boxNumbers.length > 0) ?
                    <Row className="mx-auto">
                        <Col>
                            <Form onSubmit={sendMessage}>
                                <Form.Group controlId="formBoxes" className="mb-3">
                                    <Form.Label>Safe deposit boxes available</Form.Label>
                                    <Form.Select value={boxNumber} aria-label="select box" onChange={(e) => handleChange(e.target.value)}>
                                        {boxNumbers.map((item) => {
                                            return (
                                                <option key={item} value={item}>{item}</option>
                                            );
                                        })}
                                    </Form.Select>
                                </Form.Group>
                                {(userNumbers.length > 0) ?
                                    <>
                                        <Form.Group controlId="formUser" className="mb-3">
                                            <Form.Label>Users available</Form.Label>
                                            <Form.Select value={userNumber} aria-label="select box" onChange={(e) => setUserNumber(e.target.value)}>
                                                {userNumbers.map((item) => {
                                                    return (
                                                        <option key={item} value={item}>{item}</option>
                                                    );
                                                })}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group controlId="formMessage" className="mb-3">
                                            <Form.Label>Message</Form.Label>
                                            <Form.Control type="text" id="message" placeholder="Enter message to send" required onChange={(e) => setMessage(e.target.value)} />
                                        </Form.Group>
                                        <Form.Group controlId="formImage" className="mb-3">
                                            <Form.Label>Select image to upload</Form.Label>
                                            <Form.Control type="file" id="img" accept="image/jpeg" required />
                                        </Form.Group>
                                        <Button variant="primary" type="submit">
                                            Send
                                        </Button>
                                    </>
                                    : <Row className="mx-auto"><Col><strong>There are no other users registered for this box</strong></Col></Row>}
                            </Form>
                        </Col>
                    </Row>
                    : <Row className="mx-auto"><Col><h5>You have not registered for any deposit boxes</h5></Col></Row>}
            </Container>
        </>
    );
}

export default SendMessages;