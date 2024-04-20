import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Manager_requests.css';
import Manager_Layout from '../manager_layout/Manager_Layout';
import axios from 'axios';

const Manager_requests = () => {
  // Dummy data for demonstration
  // const [requests, setRequests] = useState([
  //   { id: 1, customer: 'Customer 1', status: 'Under Review', assignedTester: '', accepted: 0 },
  //   { id: 2, customer: 'Customer 2', status: 'Under Review', assignedTester: '', accepted: 0 },
  //   { id: 3, customer: 'Customer 3', status: 'Under Review', assignedTester: '', accepted: 0 },
  //   // Add more dummy data if needed
  // ]);
  const [requests, setRequests] = useState([]);


  const fetchDataFromAPI = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/v1/projectmanager/view'); // Replace with your actual API endpoint
      const data = response.data;
      console.log(response);
      if (data && data.length > 0) {
        setRequests(data);
        console.log(requests)
      } else {
        console.error('No data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchDataFromAPI();
  }, []);
  useEffect(() => {
    console.log(requests); // Log the updated requests state
  }, [requests]);
  const handleAcceptRequest = (request_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to accept this request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Accept',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Make API call to update the accepted status in the database
          await axios.put(`http://localhost:4000/api/v1/projectmanager/update-accepted/${request_id}`, { accepted: true });
  
          // Update the local state after the request is successfully accepted in the database
          const updatedRequests = requests.map((request) =>
            request.request_id === request_id ? { ...request, accepted: true } : request
          );
          setRequests(updatedRequests);
  
          // Show success message to the user
          Swal.fire('Accepted', 'The request has been accepted', 'success');
        } catch (error) {
          console.error('Error accepting request:', error);
          // Show error message to the user
          Swal.fire('Error', 'Failed to accept the request. Please try again later.', 'error');
        }
      }
    });
  };
  const handleRejectRequest = (request_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reject this request?',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Reject',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRequests = requests.filter((request) => request.request_id !== request_id);
        setRequests(updatedRequests);
        Swal.fire('Rejected', 'The request has been rejected', 'error');
      }
    });
  };



  return (
    <Manager_Layout>
      <div className="manager-page">
        <h2>Testing Requests</h2>
        <div className="cards-container">
          {requests.map((request, index) => (
            (request.accepted === false) ? (
              <div className="card" key={index}>
                <h3>{request.customer_name}</h3>
                <p>Status: {request.status}</p>
                {request.assignedTester && <p>Assigned Tester: {request.assignedTester}</p>}
                <div className="buttons">
                  <button className="accept" onClick={() => handleAcceptRequest(request.request_id)}>
                    Accept
                  </button>
                  <button className="reject" onClick={() => handleRejectRequest(request.request_id)}>
                    Reject
                  </button>
                </div>
              </div>
            ) : null
          ))}
        </div>
      </div>
    </Manager_Layout>
  );
};

export default Manager_requests;
