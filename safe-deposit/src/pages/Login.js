import { useState, useEffect } from "react";
import { Navbar, Container, Form, Button, Modal, InputGroup, FormControl } from "react-bootstrap";
import { Link,useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Chatbot from './Chatbot';
import axios from 'axios';

const dynamoAPI = process.env.REACT_APP_DYNAMO_API;

function Login() {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [showQuestion, setShowQuestion] = useState(false);
    const [showCaesar, setShowCaesar] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [formAnswer, setFormAnswer] = useState('');
    const [cipher, setCipher] = useState('');
    const [cipherAnswer, setCipherAnswer] = useState('');
    const [shiftkey, setShiftKey] = useState('');
    const navigate = useNavigate();

    const handleQuestionClose = () => setShowQuestion(false);
    const handleCaesarClose = () => setShowCaesar(false);

    const checkAnswer = () => {
        if (formAnswer === answer) {
            axios.get(dynamoAPI + 'getshiftkey/' + user).then(response => {
                setShiftKey(response.data.data);
                generateCipher();
                setShowQuestion(false);
                setShowCaesar(true);
            });
        } else {
            //setShowQuestion(false);
            alert("Incorrect answer");
        }
    }

    const generateCipher = () => {
        const ciphers = ["nail", "fearless", "insurance", "lunchroom", "string", "haunt", "dear", "disgusting", "thick", "motionless", "lazy", "selection",
            "short", "refuse", "inform", "doubt", "root", "beds", "stroke", "steep", "size", "charge", "creature", "follow", "party", "animal", "bore", "cloth", "winter",
            "soda", "clumsy", "jump", "blueeyed", "wood", "chew", "enter", "reproduce", "example", "comb", "bulb", "grubby", "boiling", "irate", "distribution",
            "calendar", "tremendous", "scattered", "aware", "mend"];

        var random = Math.floor((Math.random() * 100)) % ciphers.length;
        setCipher(ciphers[random]);
    }

    const checkCipher = () => {
        const alphabets = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        for (var i = 0; i < cipherAnswer.length; i++) {
            if (cipherAnswer[i] !== alphabets[(alphabets.indexOf(cipher[i]) + shiftkey) % 26]) {
                alert("Cipher does not match");
                break;
            }
            sessionStorage.setItem('userId', user);
            navigate('/');
        }
    }

    useEffect(() => {
        if (sessionStorage.getItem('userId') !== null) {
            navigate('/');
        }
    }, [])

    const login = event => {
        event.preventDefault();

        axios.get(dynamoAPI + 'getuserpassword/' + user).then(response => {
            if (response.data.data === pass) {
                axios.get(dynamoAPI + 'getsecurity/' + user).then(response => {
                    setQuestion(response.data.data.question);
                    setAnswer(response.data.data.answer);
                    setShowQuestion(true);
                });
            } else {
                alert("Username or password does not exist");
            }
        });
    }

    return (
        <>
            <Helmet>
                <title>Login</title>
            </Helmet>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/">
                        <img
                            alt=""
                            src="/bank.png"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />{' '}
                        Safe Deposit
                    </Navbar.Brand>
                </Container>
            </Navbar>
            <Container className="p-5 mb-4 rounded-3">
                <h3>Login</h3>
                <Form onSubmit={login}>
                    <Form.Group controlId="formUser" className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" id="uname" placeholder="Enter username" required onChange={(e) => setUser(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formPass" className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" id="password" placeholder="Enter password" required onChange={(e) => setPass(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Login
                    </Button>
                    <Form.Group controlId="formUser" className="mb-3">
                        <span>Don't have an account?</span>
                        <Link to={"/Signup"} className={"ml-2"}>
                          <span>Register Here</span>
                        </Link>
                    </Form.Group>
                </Form>
            </Container>
            <Modal show={showQuestion} onHide={handleQuestionClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Security Question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>{question}</Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="security-answer">Answer</InputGroup.Text>
                        <FormControl aria-label="security" aria-describedby="security-answer" onChange={(e) => setFormAnswer(e.target.value)} />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={checkAnswer}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showCaesar} onHide={handleCaesarClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Solve the Cipher</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>{cipher}</Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="cipher-answer">Answer</InputGroup.Text>
                        <FormControl aria-label="cipher" aria-describedby="cipher-answer" onChange={(e) => setCipherAnswer(e.target.value)} />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={checkCipher}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
            <Chatbot />
        </>
    );
}

export default Login;