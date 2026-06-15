interface EmailTemplateProps {
  name: string;
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
  notice: string;
}

export const baseTemplate = ({
  name,
  title,
  description,
  actionText,
  actionLink,
  notice,
}: EmailTemplateProps) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${title}</title>
</head>

<body
style="
margin:0;
padding:40px 20px;
background-color:#eef2f7;
font-family:Arial, Helvetica, sans-serif;
"
>

<table
role="presentation"
cellpadding="0"
cellspacing="0"
border="0"
width="100%"
>

<tr>
<td align="center">

<table
role="presentation"
cellpadding="0"
cellspacing="0"
border="0"
width="520"
style="
background-color:#ffffff;
border-radius:24px;
overflow:hidden;
border:1px solid #e2e8f0;
"
>

<tr>
<td style="padding:40px 40px 24px 40px;">

<table width="100%">
<tr>
<td align="center">
<div
style="
font-size:26px;
font-weight:700;
color:#0f172a;
"
>
Attend<span style="color:#10b981">X</span>
</div>
</td>
</tr>
</table>

<table
width="100%"
style="margin-top:28px"
>
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
font-size:20px;
font-weight:700;
color:#0f172a;
"
>
${title}
</p>

<p
style="
margin-top:16px;
font-size:15px;
line-height:28px;
color:#475569;
"
>
${description}
</p>

</td>
</tr>

<tr>
<td style="padding:0 40px 40px 40px;">

<a
href="${actionLink}"
style="
display:block;
width:100%;
background:#10b981;
color:#fff;
text-decoration:none;
text-align:center;
padding:14px 0;
border-radius:14px;
font-size:15px;
font-weight:600;
"
>
${actionText}
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
<td
style="
padding:14px 18px;
font-size:14px;
color:#475569;
"
>
${notice}
</td>
</tr>
</table>

<table
width="100%"
style="margin:32px 0"
>
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
font-size:12px;
color:#64748b;
margin-bottom:12px;
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
${actionLink}
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
If you did not request this action, you can safely ignore this email.
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
