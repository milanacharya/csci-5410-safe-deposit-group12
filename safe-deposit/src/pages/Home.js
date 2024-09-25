import { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Navigation from './Navigation';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet'

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem('userId') === null) {
            navigate('/login');
        }
    }, [])

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>
            <Navigation />
            <Container className="p-5 mb-4 rounded-3">
                <Row>
                    <Col>
                        <Card bg="light" className="text-center">
                            {/*<Card.Img variant="top" src="holder.js/100px180" />*/}
                            <Card.Body>
                                <Card.Title>Register for Safe Deposit Box</Card.Title>
                                <Card.Text>
                                    Register for a new account or an existing account.
                                </Card.Text>
                                <Button variant="secondary" onClick={() => navigate('/register')}>Register</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card bg="light" className="text-center">
                            <Card.Body>
                                <Card.Title>Withdraw Amount</Card.Title>
                                <Card.Text>
                                    Withdraw amount from your safe deposit boxes.
                                </Card.Text>
                                <Button variant="secondary" onClick={() => navigate('/withdraw')}>Withdraw</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Card bg="light" className="text-center">
                            <Card.Body>
                                <Card.Title>Send Messages</Card.Title>
                                <Card.Text>
                                    Send messages to others users in your deposit boxes.
                                </Card.Text>
                                <Button variant="secondary" onClick={() => navigate('/send')}>Send</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card bg="light" className="text-center">
                            <Card.Body>
                                <Card.Title>View Messages</Card.Title>
                                <Card.Text>
                                    View all messages received from other users of the deposit boxes.
                                </Card.Text>
                                <Button variant="secondary" onClick={() => navigate('/view')}>View</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <Card bg="light" className="text-center">
                            <Card.Body>
                                <Card.Title>Analytics</Card.Title>
                                <Card.Text>
                                    View statistics about user balance and login.
                                </Card.Text>
                                <Button variant="secondary" onClick={() => window.open('https://datastudio.google.com/embed/reporting/b968a44c-3334-4890-b443-1bd367f5be83/page/LSNhC', '_blank')}>Analytics</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Home;