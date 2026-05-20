import React, { useState,useEffect  } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'


function Login() {
    const navigate = useNavigate()
    const [formData,setFormData]= useState({
        email:'',
        password: ''
    })
    useEffect(() => {
        let token = localStorage.getItem("token")
    
        if (token) {
            navigate("/chat", { replace: true })
        }
    }, [])

    const handleChange =(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        //console.log("formdata",formData);
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login",formData)
            toast.success(response.data.message)

            //save user data
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user))

            setTimeout(() => {
                navigate("/chat")
            }, 1500)
    
        } catch (error) {
            toast.error(error.response.data.message)
        }
        
    }
    return (
        <>
            <div className="container-fluid vh-100 bg-dark text-light">
                <div className="row h-100 justify-content-center align-items-center">
                    <div className="col-11 col-sm-8 col-md-6 col-lg-4">
                        <div className="card bg-black border border-secondary shadow-lg">
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                <h2 className="text-center fw-bold mb-4" style={{color: "#F3C587" }}>
                                    Real Time Chat App
                                </h2>

                                <h4 className="text-center mb-4" style={{color: "#50D0D0" }} >
                                    Login
                                </h4>

                                <div className="mb-3">
                                    <label className="form-label" style={{color: "#FFFFFF" }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control bg-dark text-light border-secondary"
                                        placeholder="Enter your email"
                                        name='email'
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-4" style={{color: "#FFFFFF" }}>
                                    <label className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control bg-dark text-light border-secondary"
                                        placeholder="Enter your password"
                                        name='password'
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button type='submit' className="btn btn-primary w-100 fw-semibold">
                                    Login
                                </button>

                                <p className="text-center mt-4 mb-0" style={{color: "#FFFFFF" }}>
                                    Don't have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="text-decoration-none text-info"
                                    >
                                        Register
                                    </Link>
                                </p>

                                </form>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}

export default Login
