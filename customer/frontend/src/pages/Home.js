import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        to="/dashboard"
                        className="flex flex-col justify-center items-center bg-gray-200 p-6 rounded-lg hover:bg-gray-300 transform transition duration-300 ease-in-out hover:scale-105"
                    >
                        <img
                            src='dashboard.png'
                            alt="Dashboard"
                            className="w-24 h-24 mb-4 object-cover"
                        />
                        <h2 className="text-center font-bold text-lg">Dashboard</h2>
                        <p className="text-center">View Dashboard</p>
                    </Link>
                    <Link
                        to="/requests"
                        className="flex flex-col justify-center items-center bg-gray-200 p-6 rounded-lg hover:bg-gray-300 transform transition duration-300 ease-in-out hover:scale-105"
                    >
                        <img
                            src='raise.png'
                            alt="Test Request"
                            className="w-24 h-24 mb-4 object-cover"
                        />
                        <h2 className="text-center font-bold text-lg">Raise Test Request</h2>
                        <p className="text-center">Raise a new test request</p>
                    </Link>
                    <Link
                        to="/buginfo"
                        className="flex flex-col justify-center items-center bg-gray-200 p-6 rounded-lg hover:bg-gray-300 transform transition duration-300 ease-in-out hover:scale-105"
                    >
                        <img
                            src='bug.png'
                            alt="Bug Info"
                            className="w-24 h-24 mb-4 object-cover"
                        />
                        <h2 className="text-center font-bold text-lg">Bug Info</h2>
                        <p className="text-center">View Bug Information</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
