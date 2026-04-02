
import './App.css'
import { useEffect, useState } from 'react'
import NullZone from './assets/full_name_logo_without_moto.svg'
import Logo from './assets/nullzone_logo.png'
import ProfileStandinImg from './assets/images/profile-img-standin.png'
import ProfileCard from './Components/Frontend/ProfileCard/ProfileCard'
import ProfileIcon from './Components/Frontend/ProfileIcon/ProfileIcon'
import NavBar from './Components/Frontend/NavBar/NavBar'
import NavItem from './Components/Frontend/NavItem/NavItem'
import BigLogo from './Components/Frontend/BigLogo/BigLogo'
import ProjectSlider from './Components/Frontend/ProjectsSlider/ProjectsSlider'
import ProjectCard from './Components/Frontend/ProjectCard/ProjectCard'
import LogInForm from './Components/Frontend/LogInForm/LogInForm'
import SignUpForm from './Components/Frontend/SignUpForm/SignUpForm'
import ForgotPasswordForm from './Components/Frontend/ForgotPasswordForm/ForgotPasswordForm'
import UserProfile from './Components/Frontend/UserProfile/UserProfile'
import Footer from './Components/Frontend/Footer/Footer'
import ContactForm from './Components/Frontend/ContactForm/ContactForm'
import MiniProfileManager from './Components/Users/MiniProfileManager'
import GameImage from './assets/images/games.png'
import Lasse from './assets/images/1726596348123.jpg'
import Christian from './assets/images/449187669_122109069980371692_872749802735156476_n.jpg'
import Stefanie from './assets/images/Screenshot_20260309_205407_Gallery.jpg'
import Silas from './assets/images/silas.png'
import Philip from './assets/images/FB_IMG_1773154787289.jpg'
import Blog from './Components/Frontend/Blog/Blog'
import CookiePopup from './Components/Frontend/CookieWarning/CookieWarning'
import Throbber from './Components/Frontend/Throbber/Throbber'
import LoadingError from './Components/Frontend/LoadingError/LoadingError'
import useEmployees from './hooks/useEmployees'
import useProjects from './hooks/useProjects'
import useBlog from './hooks/useBlog'
import RobbyProfile from './assets/images/RobbyProfile.svg'
import ResetPasswordForm from './Components/Frontend/ResetPasswordForm/ResetPasswordForm'
import useAuth from './hooks/useAuth'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute'

function App() {
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showSignUpPanel, setShowSignUpPanel] = useState(false);
  const [showForgotPasswordPanel, setShowForgotPasswordPanel] = useState(false);
  const [showUserProfilePanel, setShowUserProfilePanel] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const [userProfile, setUserProfile] = useState({
    profileImage: null,
    name: "N/A",
    lastName: "N/A",
    displayName: "N/A",
    email: "N/A",
    birthdate: "N/A",
    gender: "N/A",
    about: "N/A"
  });

  const employees = useEmployees();
  const projects = useProjects();
  const blog = useBlog();
  const { user, getProfile, logout } = useAuth();

  const handleLoginClick = () => {
    setShowLoginPanel(!showLoginPanel);
  };

  const handleSignUpClick = () => {
    setShowSignUpPanel(true);
    setShowLoginPanel(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPasswordPanel(true);
    setShowLoginPanel(false);
  };

  const handleUserProfileClick = () => {
    console.log("User profile click triggered");
    setShowUserProfilePanel(!showUserProfilePanel);
  };

  const handleUserProfileSave = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setTimeout(() => setResetToken(token), 0);
      window.history.replaceState({}, '', '/'); // Clear the token from the URL
    }

    getProfile().then(data => {
        setUserProfile({
            name: data.firstName,
            lastName: data.lastName,
            displayName: data.displayName,
            email: data.email,
            birthdate: data.birthdate ?? '',
            gender: data.gender ?? '',
            about: data.about ?? '',
            profileImage: data.profileImage
        })
    }).catch(err => {
        console.error("Failed to fetch user profile:", err);
        setUserProfile({
            name: "N/A",
            lastName: "N/A",
            displayName: "N/A",
            email: "N/A",
            birthdate: "N/A",
            gender: "N/A",
            about: "N/A",
            profileImage: null
        });
    })

  }, [resetToken, getProfile, user]);

  return (
    <>
      <NavBar logo={Logo}>
        <NavItem href="#about-us" icon="info-circle-fill">About us</NavItem>
        <NavItem href="#projects" icon="folder-fill">Projects</NavItem>
        <NavItem href="#blog" icon="stack">Blog</NavItem>
        <NavItem href="#contact-us" icon="telephone-fill">Contact us</NavItem>
        {console.log(user?.accessLevel)}
        {(user?.accessLevel === 1 || user?.accessLevel === 'Admin') && <NavItem href="/admin" icon="shield-lock-fill">Admin Panel</NavItem>}
        {!user ? <NavItem onClick={handleLoginClick} icon="lock-fill">Log in</NavItem> : <NavItem icon="unlock2-fill" onClick={logout}>Log out</NavItem>}
        <NavItem onClick={user ? handleUserProfileClick : handleLoginClick} disableHoverEffect><ProfileIcon isInteractive={false} src={userProfile.profileImage} fallbackSrc={user ? RobbyProfile : ProfileStandinImg}></ProfileIcon></NavItem>
      </NavBar>
      <section id="front">
        <div className="content">
          <BigLogo logo={NullZone} />
        </div>
      </section>
      <section id="about-us" >
          <div className="text-container">
              <div className="about">
                  <h3>About Us</h3>
                  <p>NullZone Studios is an independent game development studio focused on creating replayable and system-driven PC games.
Founded by a team of five developers, we combine technical gameplay design with creative experimentation to build experiences where every run feels different. Our work is heavily inspired by roguelike and roguelite design philosophies, where player choices, evolving systems, and emergent gameplay create unique outcomes each time you play.
Alongside our roguelite prototypes, we also explore incremental and idle game mechanics, experimenting with progression systems that reward curiosity, strategy, and long-term engagement.</p>
              </div>
              <div className="vision">
                  <h3>Our Vision</h3>
                  <p>At NullZone Studios, we believe great games are built through iteration, experimentation, and a deep understanding of game systems. Every project we create is an opportunity to test new ideas, refine mechanics, and craft experiences that players can return to again and again.
              Our current focus is developing PC games that emphasize replayability, meaningful systems, and creative gameplay design.
              
            Designing Games Where Every Run Is a New Experiment.</p>
              </div>
          </div>
          <h3 id="team-header">Meet The Team</h3>
          <div className="content card-container">
          {employees.loading && <Throbber />}
          {employees.error && <LoadingError error={employees.error} />}
          {employees.employees.map((employee, index) => (
            <ProfileCard
              key={index}
              name={`${employee.firstName} ${employee.lastName}`}
              jobTitle={employee.jobTitle}
              img={employee.profileImage}
              about={employee.about}
            />
          ))}
          </div>
      </section>
      <section id="projects">
            <div className="header">
                <h1>Check out our recent projects</h1>
            </div>
              {projects.loading && <Throbber />}
              {projects.error && <LoadingError error={projects.error} />}
            {!projects.loading && <ProjectSlider>
              {projects.projects.map(project => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  content={project.content}
                  href={project.href}
                  bannerImg={project.bannerImageUrl}
                />
              ))
              }
            </ProjectSlider>
            }
      </section>
      <section id="blog" >
        <div className="header">
          <h1>Check out our recent blog posts</h1>
        </div>
        {blog.loading && <Throbber />}
        {blog.error && <LoadingError error={blog.error} />}
        {!blog.loading && <Blog posts={blog.posts} callbacks={{ react: blog.react, comment: blog.comment, getComments: blog.getComments, deletePost: blog.deletePost }} />}
      </section>
      <section id="contact-us">
        <ContactForm />
      </section>
      <Footer />
      <MiniProfileManager />
      <CookiePopup />
      <LogInForm isOpen={showLoginPanel} onClose={() => setShowLoginPanel(false)} onSignUpClick={handleSignUpClick} onForgotPasswordClick={handleForgotPasswordClick} />
      <SignUpForm isOpen={showSignUpPanel} onClose={() => setShowSignUpPanel(false)} onSwitchToLogin={() => { setShowSignUpPanel(false); setShowLoginPanel(true); }} />
      <ForgotPasswordForm isOpen={showForgotPasswordPanel} onClose={() => setShowForgotPasswordPanel(false)} />
      <UserProfile
        isOpen={showUserProfilePanel}
        onClose={() => setShowUserProfilePanel(false)}
        profileImage={userProfile.profileImage}
        name={userProfile.name}
        lastName={userProfile.lastName}
        displayName={userProfile.displayName}
        email={userProfile.email}
        birthdate={userProfile.birthdate}
        gender={userProfile.gender}
        about={userProfile.about}
        onSave={handleUserProfileSave}
      />
      <ResetPasswordForm
        isOpen={resetToken !== null}
        onClose={() => setResetToken(null)}
        token={resetToken}
      />
    </>
  )
}

export default App
