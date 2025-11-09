function UserPage() {
  return (
    <section className="flex flex-col items-center justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">User Details: </legend>

        <label className="label">Email: </label>
        <input
          type="email"
          className="input input-primary"
          placeholder="Email"
        />

        <label className="label">Name: </label>
        <input
          type="text"
          className="input input-primary"
          placeholder="F-name"
        />
        <input
          type="text"
          className="input input-primary"
          placeholder="L-name"
        />

        <button className="btn btn-neutral mt-4">Save Changes</button>
      </fieldset>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 mt-8">
        <legend className="fieldset-legend">Change Password: </legend>
        <input
          type="password"
          className="input input-primary"
          placeholder="Password"
        />
        <input
          type="password"
          className="input input-primary"
          placeholder="Confirm Password"
        />

        <button className="btn btn-neutral mt-4">Update Password</button>
      </fieldset>
    </section>
  );
}

export default UserPage;
