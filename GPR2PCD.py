# -*- coding: utf-8 -*-
"""
Created on Mon Jul  8 12:01:38 2024

@author: user
Merge each slice into one CSV file so that PCD software could recognize as a 3D file.
"""

import os
import pandas as pd
import re
from tqdm import tqdm
import zipfile
from pathlib import Path

# 定义输入路径（可以是文件夹或zip文件）
input_path = 'E:\\OneDrive - The University of Hong Kong - Connect\\sci_research\\projectCode\\VoxelAdjust\\pcd_postprocessing\\pcd_data\\GPRMax_output_grid_lab_sample2_260526.zip'

# 检查输入是zip文件还是文件夹
input_path_obj = Path(input_path)
is_zip = input_path_obj.suffix.lower() == '.zip'

if is_zip:
    # 处理zip文件
    print(f'检测到ZIP文件: {input_path}')
    
    # 打开zip文件
    with zipfile.ZipFile(input_path, 'r') as zip_ref:
        # 获取zip中所有CSV文件并按文件名中的顺序排序
        all_files = zip_ref.namelist()
        csv_files = sorted(
            [f for f in all_files if 'Slice' in os.path.basename(f) and f.endswith('.csv')],
            key=lambda x: int(re.search(r'Slice (\d+) -', x).group(1))
        )
        
        # 初始化一个空的DataFrame，用于存储合并后的数据
        merged_df = pd.DataFrame()
        
        # 使用tqdm包装文件列表，显示处理进度
        for csv_file in tqdm(csv_files, desc='Processing files', unit='file'):
            # 从zip中读取CSV文件
            with zip_ref.open(csv_file) as file:
                df = pd.read_csv(file)
            
            # 使用正则表达式从文件名中提取数字
            match = re.search(r'Slice \d+ - ([0-9]+(?:\.[0-9]+)?) m\.csv', os.path.basename(csv_file))
            if match:
                z_value = -float(match.group(1))  # 提取的数字作为Z列的值
                # 在Y列之后Amplitude列之前添加Z列
                df.insert(loc=df.columns.get_loc('Amplitude'), column='Z', value=z_value)
            else:
                continue  # 如果文件名不符合预期格式，则跳过
            
            # 将当前文件的数据追加到合并的DataFrame中
            merged_df = pd.concat([merged_df, df], ignore_index=True)
    
    # 输出文件路径（zip文件名去掉.zip后缀）
    output_file_path = str(input_path_obj.with_suffix('.csv'))
    
else:
    # 处理文件夹
    print(f'检测到文件夹: {input_path}')
    folder_path = input_path
    
    # 获取文件夹下所有的CSV文件并按文件名中的顺序排序
    csv_files = sorted(
        [f for f in os.listdir(folder_path) if f.startswith('Slice') and f.endswith('.csv')],
        key=lambda x: int(re.search(r'Slice (\d+) -', x).group(1))
    )
    
    # 初始化一个空的DataFrame，用于存储合并后的数据
    merged_df = pd.DataFrame()
    
    # 使用tqdm包装文件列表，显示处理进度
    for csv_file in tqdm(csv_files, desc='Processing files', unit='file'):
        # 构造文件的完整路径
        file_path = os.path.join(folder_path, csv_file)
        
        # 读取CSV文件
        df = pd.read_csv(file_path)
        
        # 使用正则表达式从文件名中提取数字
        match = re.search(r'Slice \d+ - ([0-9]+(?:\.[0-9]+)?) m\.csv', csv_file)
        if match:
            z_value = -float(match.group(1))  # 提取的数字作为Z列的值
            # 在Y列之后Amplitude列之前添加Z列
            df.insert(loc=df.columns.get_loc('Amplitude'), column='Z', value=z_value)
        else:
            continue  # 如果文件名不符合预期格式，则跳过
        
        # 将当前文件的数据追加到合并的DataFrame中
        merged_df = pd.concat([merged_df, df], ignore_index=True)
    
    # 输出文件路径
    output_file_path = os.path.join(folder_path + '.csv')
print('Writing into the file...')
merged_df.to_csv(output_file_path, index=False)
print(f'Merged CSV file has been created at {output_file_path}')