import { useState } from "react";
import axios from "axios";
import Navigation from './Navigation';
import { Container, Accordion, Form, Button, Row, Col } from "react-bootstrap";
import { Helmet } from 'react-helmet'

const dynamoAPI = process.env.REACT_APP_DYNAMO_API;
const storageAPI = process.env.REACT_APP_CLOUD_STORAGE_API;

function Register() {
    const [boxNumber, setBoxNumber] = useState('');

    const registerNewBox = event => {
        event.preventDefault();
        const data = { userId: sessionStorage.getItem('userId') };
        var config = {
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        }

        axios.post(dynamoAPI + 'registernewbox', data, config).then(response => {
            var imagefile = document.querySelector('#img');
            var formData = new FormData();
            formData.append('file', imagefile.files[0]);
            formData.append('boxId', response.data.data);
            formData.append('userId', sessionStorage.getItem('userId'));
            config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            }

            async function uploadImage() {
                await axios.post(storageAPI + 'upload', formData, config).then(response => {
                    alert("Registered new deposit box");
                }).catch(error => {
                    alert("Failed to register new deposit box");
                    console.log("Error", error);
                });
            }
            uploadImage();
        })
    }

    const registerExistingBox = event => {
        event.preventDefault();
        const data = { userId: sessionStorage.getItem('userId'), boxId: boxNumber };
        var config = {
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        }

        axios.get(dynamoAPI + 'getdepositboxusers/' + boxNumber).then(response => {
            if (response.data.data === undefined) {
                alert("Deposit box does not exist");
                return;
            }

            var exists = false;
            response.data.data.forEach(user => {
                if (sessionStorage.getItem('userId') === user)
                    exists = true;
            });

            if (exists) {
                alert("You are already registered for this deposit box");
                return;
            }

            if (response.data.data.length > 2) {
                alert("Maximum number of users already registered for this deposit box");
                return;
            }

            axios.put(dynamoAPI + 'registerexistingbox', data, config).then(response => {
                var imagefile = document.querySelector('#imgexist');
                var formData = new FormData();
                formData.append('file', imagefile.files[0]);
                formData.append('boxId', boxNumber);
                formData.append('userId', sessionStorage.getItem('userId'));

                async function uploadImage() {
                    await axios.post(storageAPI + 'upload', formData, config).then(response => {
                        alert("Registered in existing deposit box");
                    }).catch(error => {
                        alert("Failed to register in existing deposit box");
                        console.log("Error", error);
                    });
                }
                uploadImage();
            })
        });
    }

    return (
        <>
            <Helmet>
                <title>Register</title>
            </Helmet>
            <Navigation />
            <Container className="p-5 mb-4 rounded-3">
                <Row className="mx-auto">
                    <Col>
                        <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Register for new deposit box</Accordion.Header>
                                <Accordion.Body>
                                    <Form onSubmit={registerNewBox}>
                                        <Form.Group controlId="formImage" className="mb-3">
                                            <Form.Label>Select image to upload</Form.Label>
                                            <Form.Control type="file" id="img" accept="image/jpeg" required />
                                        </Form.Group>
                                        <Button variant="primary" type="submit">
                                            Register
                                        </Button>
                                    </Form>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Register for existing deposit box</Accordion.Header>
                                <Accordion.Body>
                                    <Form onSubmit={registerExistingBox}>
                                        <Form.Group controlId="formBox" className="mb-3">
                                            <Form.Label>Safe deposit box number</Form.Label>
                                            <Form.Control type="text" id="number" placeholder="Enter the deposit box number" required onChange={(e) => setBoxNumber(e.target.value)} />
                                        </Form.Group>
                                        <Form.Group controlId="formExistImage" className="mb-3">
                                            <Form.Label>Select image to upload</Form.Label>
                                            <Form.Control type="file" id="imgexist" accept="image/jpeg" required />
                                        </Form.Group>
                                        <Button variant="primary" type="submit">
                                            Register
                                        </Button>
                                    </Form>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Register;