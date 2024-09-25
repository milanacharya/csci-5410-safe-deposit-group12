import { useEffect, useState } from "react";
import axios from 'axios';
import Navigation from './Navigation';
import { Container, Form, Button, Row, Col, Table } from "react-bootstrap";
import { Helmet } from 'react-helmet'

const dynamoAPI = process.env.REACT_APP_DYNAMO_API;

function Withdraw() {
    const [amount, setAmount] = useState('');
    const [boxNumber, setBoxNumber] = useState('');
    const [boxNumbers, setBoxNumbers] = useState([]);
    const [balance, setBalance] = useState('');

    useEffect(() => {
        async function getDepositBoxes() {
            await axios.get(dynamoAPI + 'getuserdepositboxes/' + sessionStorage.getItem('userId')).then(response => {
                setBoxNumber(response.data.data[0]);
                setBoxNumbers(response.data.data);
                getBalance(response.data.data[0]);
            });
        }
        getDepositBoxes();
    }, [])

    const getBalance = depositBoxNumber => {
        setBoxNumber(depositBoxNumber);
        axios.get(dynamoAPI + 'getdepositboxbalance/' + depositBoxNumber).then(response => {
            setBalance(response.data.data);
        });
    }

    const withdrawAmount = event => {
        event.preventDefault();
        const data = { userId: sessionStorage.getItem('userId'), amount: parseFloat(amount), boxId: boxNumber };
        console.log(data)

        if (amount > balance) {
            alert("Amount must be less than balance");
            return;
        }

        fetch(dynamoAPI + 'withdraw', {
            mode: 'cors',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                alert("Withdraw successful");
                getBalance(boxNumber);
            }
            else {
                alert("Withdraw failed");
            }
        })
    }

    return (
        <>
            <Helmet>
                <title>Withdraw</title>
            </Helmet>
            <Navigation />
            <Container className="p-5 mb-4 rounded-3" style={{ display: 'flex' }}>
                {(boxNumbers.length > 0) ?
                    <Row className="mx-auto">
                        <Col>
                            <Form onSubmit={withdrawAmount}>
                                <Form.Group controlId="formBoxes" className="mb-3">
                                    <Form.Label>Safe deposit boxes available</Form.Label>
                                    <Form.Select value={boxNumber} aria-label="select box" onChange={(e) => getBalance(e.target.value)}>
                                        {boxNumbers.map((item) => {
                                            return (
                                                <option key={item} value={item}>{item}</option>
                                            );
                                        })}
                                    </Form.Select>
                                </Form.Group>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Box Number</th>
                                            <th>Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{boxNumber}</td>
                                            <td>{balance}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <Form.Group controlId="formAmount" className="mb-3">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control type="number" id="number" min="0" max="5000" placeholder="Amount to withdraw" required onChange={(e) => setAmount(e.target.value)} />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Withdraw
                                </Button>
                            </Form>
                        </Col>
                    </Row>
                    : <Row className="mx-auto"><Col><h5>You have not registered for any deposit boxes</h5></Col></Row>}
            </Container>
        </>
    );
}
export default Withdraw;