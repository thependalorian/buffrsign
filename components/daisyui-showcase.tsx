"use client";

import { useState } from "react";
import Image from "next/image";

export function DaisyUIShowcase() {
  const [activeTab, setActiveTab] = useState("buttons");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-8 bg-base-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-base-content">
          DaisyUI Components with BuffrSign Theme
        </h1>
        
        {/* Theme Toggle */}
        <div className="flex justify-center mb-8">
          <div className="join">
            <button 
              className="btn join-item" 
              onClick={() => document.documentElement.setAttribute('data-theme', 'buffrsign')}
            >
              Light Theme
            </button>
            <button 
              className="btn join-item" 
              onClick={() => document.documentElement.setAttribute('data-theme', 'buffrsign-dark')}
            >
              Dark Theme
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs tabs-boxed justify-center mb-8">
          <button 
            className={`tab ${activeTab === "buttons" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("buttons")}
          >
            Buttons
          </button>
          <button 
            className={`tab ${activeTab === "cards" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("cards")}
          >
            Cards
          </button>
          <button 
            className={`tab ${activeTab === "forms" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("forms")}
          >
            Forms
          </button>
          <button 
            className={`tab ${activeTab === "alerts" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            Alerts
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === "buttons" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-base-content">Button Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Primary Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-base-content">Primary Actions</h3>
                <button className="btn btn-primary w-full">Primary Button</button>
                <button className="btn btn-primary btn-outline w-full">Primary Outline</button>
                <button className="btn btn-primary btn-ghost w-full">Primary Ghost</button>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-base-content">AI Features</h3>
                <button className="btn btn-secondary w-full">AI Analysis</button>
                <button className="btn btn-secondary btn-outline w-full">AI Outline</button>
                <button className="btn btn-secondary btn-ghost w-full">AI Ghost</button>
              </div>

              {/* Accent Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-base-content">Compliance</h3>
                <button className="btn btn-accent w-full">Compliance Check</button>
                <button className="btn btn-accent btn-outline w-full">Compliance Outline</button>
                <button className="btn btn-accent btn-ghost w-full">Compliance Ghost</button>
              </div>

              {/* Size Variants */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-base-content">Button Sizes</h3>
                <button className="btn btn-primary btn-xs w-full">Extra Small</button>
                <button className="btn btn-primary btn-sm w-full">Small</button>
                <button className="btn btn-primary w-full">Normal</button>
                <button className="btn btn-primary btn-lg w-full">Large</button>
              </div>

              {/* State Variants */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-base-content">Button States</h3>
                <button className="btn btn-primary w-full" disabled>Disabled</button>
                <button className="btn btn-primary btn-loading w-full">Loading</button>
                <button className="btn btn-primary w-full">Normal</button>
              </div>

              {/* Color Variants */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-base-content">Status Colors</h3>
                <button className="btn btn-info w-full">Info</button>
                <button className="btn btn-success w-full">Success</button>
                <button className="btn btn-warning w-full">Warning</button>
                <button className="btn btn-error w-full">Error</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cards" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-base-content">Card Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Card */}
              <div className="card bg-base-100 shadow-xl">
                <figure>
                  <Image src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" width={500} height={500} />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">Document Analysis</h2>
                  <p>AI-powered document analysis with intelligent field detection.</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">Analyze</button>
                  </div>
                </div>
              </div>

              {/* Card with Badge */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="card-title">Digital Signature</h2>
                    <div className="badge badge-primary">ETA 2019</div>
                  </div>
                  <p>Legally binding digital signatures with full compliance.</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-secondary">Sign Now</button>
                  </div>
                </div>
              </div>

              {/* Interactive Card */}
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="card-body">
                  <h2 className="card-title">Workflow Management</h2>
                  <p>Multi-party signing workflows with automated tracking.</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-accent">Create Workflow</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "forms" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-base-content">Form Components</h2>
            
            <div className="max-w-2xl mx-auto">
              <form className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Document Title</span>
                  </label>
                  <input type="text" placeholder="Enter document title" className="input input-bordered w-full" />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Document Type</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option>Select document type</option>
                    <option>Contract</option>
                    <option>Agreement</option>
                    <option>Certificate</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea className="textarea textarea-bordered h-24" placeholder="Enter document description"></textarea>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Require AI Analysis</span>
                    <input type="checkbox" className="checkbox checkbox-primary" />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Enable Compliance Check</span>
                    <input type="radio" name="compliance" className="radio radio-primary" />
                  </label>
                </div>

                <div className="form-control mt-6">
                  <button className="btn btn-primary w-full">Upload Document</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-base-content">Alert Components</h2>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>AI analysis completed successfully. 3 signature fields detected.</span>
              </div>

              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Document compliance verified. ETA 2019 requirements met.</span>
              </div>

              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Document contains sensitive information. Review before sharing.</span>
              </div>

              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Authentication failed. Please check your credentials and try again.</span>
              </div>
            </div>

            {/* Modal Example */}
            <div className="text-center mt-8">
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                Open Modal
              </button>
            </div>

            {/* Modal */}
            {modalOpen && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Document Upload Success!</h3>
                  <p className="py-4">Your document has been successfully uploaded and is ready for AI analysis.</p>
                  <div className="modal-action">
                    <button className="btn btn-primary" onClick={() => setModalOpen(false)}>
                      Continue
                    </button>
                  </div>
                </div>
                <div className="modal-backdrop" onClick={() => setModalOpen(false)}></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
