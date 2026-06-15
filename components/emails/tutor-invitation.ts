export const tutorLoginDetailsTemplate = ({
  name,
  email,
  password,
  loginLink,
}: {
  name: string;
  email: string;
  password: string;
  loginLink: string;
}) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Tutor Account Created</title>
</head>

<body
style="
margin:0;
padding:40px 20px;
background-color:#eef2f7;
font-family:Arial, Helvetica, sans-serif;
"
>

<table width="100%" role="presentation">
<tr>
<td align="center">

<table
width="520"
role="presentation"
style="
background:#fff;
border-radius:24px;
overflow:hidden;
border:1px solid #e2e8f0;
"
>

<tr>
<td style="padding:40px 40px 24px 40px;">

<div
style="
font-size:26px;
font-weight:700;
color:#0f172a;
text-align:center;
"
>
Attend<span style="color:#10b981">X</span>
</div>

<table width="100%" style="margin-top:28px">
<tr>
<td
style="
border-top:1px solid #e2e8f0;
font-size:0;
line-height:0;
"
>
&nbsp;
</td>
</tr>
</table>

<p
style="
margin-top:32px;
font-size:14px;
color:#64748b;
font-weight:500;
"
>
Hi ${name},
</p>

<p
style="
margin-top:20px;
font-size:15px;
line-height:28px;
color:#475569;
"
>
Your tutor account has been successfully created.
Use the credentials below to sign in and begin managing your assigned courses.
</p>

</td>
</tr>

<tr>
<td style="padding:0 40px 40px 40px;">

<a
href="${loginLink}"
style="
display:block;
width:100%;
background-color:#10b981;
color:#ffffff;
text-decoration:none;
text-align:center;
padding:14px 0;
border-radius:14px;
font-size:15px;
font-weight:600;
"
>
Login To Account
</a>

<table
width="100%"
style="
margin-top:24px;
border:1px solid #dbe4f0;
background:#f8fafc;
border-radius:14px;
"
>
<tr>
<td style="padding:18px;">

<p
style="
margin:0 0 12px;
font-size:13px;
font-weight:600;
color:#0f172a;
"
>
Login Credentials
</p>

<p
style="
margin:0 0 8px;
font-size:14px;
color:#475569;
"
>
<strong>Email:</strong> ${email}
</p>

<p
style="
margin:0;
font-size:14px;
color:#475569;
"
>
<strong>Password:</strong> ${password}
</p>

</td>
</tr>
</table>

<table width="100%" style="margin:32px 0">
<tr>
<td
style="
border-top:1px solid #e2e8f0;
font-size:0;
line-height:0;
"
>
&nbsp;
</td>
</tr>
</table>

<p
style="
margin:0 0 12px;
font-size:12px;
color:#64748b;
line-height:22px;
"
>
If the button above doesn’t work, copy and paste this link into your browser:
</p>

<table
width="100%"
style="
border:1px solid #e2e8f0;
background:#f8fafc;
border-radius:14px;
"
>
<tr>
<td
style="
padding:14px;
font-size:12px;
line-height:20px;
word-break:break-all;
color:#475569;
"
>
${loginLink}
</td>
</tr>
</table>

<p
style="
margin-top:28px;
font-size:12px;
line-height:22px;
color:#64748b;
"
>
For security reasons, we recommend changing your password after your first login.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
