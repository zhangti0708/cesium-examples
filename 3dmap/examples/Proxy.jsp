<%@page session="false"%>
<%@page import="java.net.*,java.io.*" %>
<%@ page pageEncoding="UTF-8" isELIgnored="false" %>
<%
/**
*Ϊʵ�ֿͻ��˿������������jsp�����Ĵ���ת����
*ʹ�÷�ʽ��
*�����ļ�����iserver webapps������Ĺ���Ŀ¼�£������ʽ��http://localhost:8090/yourRoot/Proxy.jsp?url=yoururl,ע��url�����������ַ���Ҫת�롣
*֧��post��get����
*/
try {
	String reqUrl = request.getQueryString();
	
	URL url = new URL(reqUrl);
	HttpURLConnection con = (HttpURLConnection)url.openConnection();
	//con.setRequestProperty("content-type", "application/xml; charset=UTF-8");
	con.setDoOutput(true);
	con.setRequestMethod(request.getMethod());
	//con.setCharacterEncoding("UTF-8");  
	int clength = request.getContentLength();
	if(clength > 0 && false) {
		con.setDoInput(true);
		byte[] idata = new byte[clength];
		
		//String s = String.ValueOf(clength);
		//System.out.println(clength);
		
		BufferedReader br = new BufferedReader(new InputStreamReader((ServletInputStream)request.getInputStream()));  
		String line1 = null;  
		StringBuilder sb = new StringBuilder();  
		while((line1 = br.readLine())!=null){  
		   sb.append(line1);  
		}
		//request.getInputStream().read(idata, 0, clength);
		//String test=String.valueOf(idata);
		//System.out.println(sb);
		
		//OutputStreamWriter out=new OutputStreamWriter(con.getOutputStream()); 
		//out.write(new String(sb.toString().getBytes("ISO-8859-1")));

		byte[] paradata = sb.toString().getBytes();
		
		OutputStream os = response.getOutputStream();
		os.write(paradata);
	}
	response.setContentType(con.getContentType());
	int data;
	InputStream is = con.getInputStream();
	OutputStream os = response.getOutputStream();
while((data = is.read()) != -1) {
	os.write(data);
}
is.close();
	/*InputStream instream = con.getInputStream();
	BufferedReader reader = new BufferedReader(new InputStreamReader(instream));
    String line = reader.readLine();
	String responseBody = ""; 
	while (line != null) {
		responseBody += line;
		line = reader.readLine();
	}
	out.print(responseBody);
	reader.close();*/

} catch(Exception e) {
System.out.println(0);
System.out.println(e);

	response.setStatus(500);
}
%>