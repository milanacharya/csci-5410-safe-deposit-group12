import { Navbar, Container, Nav } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';

function Navigation() {
    const navigate = useNavigate();

    const signout = event => {
        sessionStorage.clear();
        navigate('/login');
    }

    return (
        <>
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
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/register">Register</Nav.Link>
                            <Nav.Link href="/withdraw">Withdraw</Nav.Link>
                            <Nav.Link href="/send">Send Messages</Nav.Link>
                            <Nav.Link href="/view">View Messages</Nav.Link>
                            <Nav.Link href="https://datastudio.google.com/embed/reporting/b968a44c-3334-4890-b443-1bd367f5be83/page/LSNhC" target="_blank">Analytics</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            <Nav.Link onClick={signout}>Signout</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default Navigation;